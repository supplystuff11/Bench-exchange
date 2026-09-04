import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

// POST /api/reviews  { orderId, role: "SELLER" | "BUYER", rating, comment? }
// role = which side of the order is being reviewed. A buyer leaves a
// role="SELLER" review (rating the seller); a seller leaves a role="BUYER"
// review (rating the buyer). Each is capped at one per order, so the two
// directions never mix into a single combined rating.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const userId = (session.user as any).id;

  const { orderId, role, rating, comment } = await req.json();
  if (!orderId || (role !== "SELLER" && role !== "BUYER")) {
    return NextResponse.json({ error: "orderId and a valid role are required" }, { status: 400 });
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { listing: true },
  });
  if (!order || order.status !== "paid") {
    return NextResponse.json({ error: "Order not found or not completed yet" }, { status: 400 });
  }

  let targetId: string;
  if (role === "SELLER") {
    if (order.buyerId !== userId) {
      return NextResponse.json({ error: "Only the buyer on this order can rate the seller" }, { status: 403 });
    }
    targetId = order.listing.sellerId;
  } else {
    if (order.listing.sellerId !== userId) {
      return NextResponse.json({ error: "Only the seller on this order can rate the buyer" }, { status: 403 });
    }
    targetId = order.buyerId;
  }

  try {
    const review = await prisma.review.create({
      data: { orderId, authorId: userId, targetId, role, rating, comment },
    });

    await notify({
      userId: targetId,
      type: "NEW_REVIEW",
      title: `You got a new ${rating}★ review`,
      body: comment || undefined,
      link: `/profile/${targetId}`,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "You've already reviewed this order" }, { status: 400 });
    }
    throw err;
  }
}
