import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/favorites/[listingId] — toggles favorite on/off, returns new state
export async function POST(_req: NextRequest, { params }: { params: { listingId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const userId = (session.user as any).id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId, listingId: params.listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, listingId: params.listingId } });
  return NextResponse.json({ favorited: true });
}
