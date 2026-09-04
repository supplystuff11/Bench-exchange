import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["active", "pending", "sold"];

// PATCH /api/listings/[id]/status  { status }
// Lets a seller manually flip a listing between active/pending/sold — for
// deals that happen outside the app (cash, local pickup) where there's no
// Stripe order to drive the status automatically.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const userId = (session.user as any).id;

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (listing.sellerId !== userId) {
    return NextResponse.json({ error: "You can only update your own listings" }, { status: 403 });
  }
  if (listing.status === "removed") {
    return NextResponse.json({ error: "This listing has been removed" }, { status: 400 });
  }

  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.listing.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(updated);
}
