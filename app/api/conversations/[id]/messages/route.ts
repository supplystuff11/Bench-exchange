import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

async function requireParticipant(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { listing: { select: { title: true } } },
  });
  if (!conversation) return { error: "Conversation not found", status: 404 as const };
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    return { error: "Not part of this conversation", status: 403 as const };
  }
  return { conversation };
}

// GET /api/conversations/[id]/messages — also marks the other side's
// messages as read for the current user.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const userId = (session.user as any).id;

  const result = await requireParticipant(params.id, userId);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { conversationId: params.id, senderId: { not: userId }, read: false },
    data: { read: true },
  });

  return NextResponse.json(messages);
}

// POST /api/conversations/[id]/messages  { body }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const userId = (session.user as any).id;

  const result = await requireParticipant(params.id, userId);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  const conversation = result.conversation;

  const { body } = await req.json();
  if (!body || !body.trim()) return NextResponse.json({ error: "Message can't be empty" }, { status: 400 });

  const message = await prisma.message.create({
    data: { conversationId: params.id, senderId: userId, body: body.trim() },
  });

  const otherUserId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
  await notify({
    userId: otherUserId,
    type: "MESSAGE_RECEIVED",
    title: `New message about "${conversation.listing.title}"`,
    body: body.trim().slice(0, 140),
    link: `/messages/${params.id}`,
  });

  return NextResponse.json(message, { status: 201 });
}
