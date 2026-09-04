import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

// GET /api/offers?box=received|sent — for the inbox page
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const userId = (session.user as any).id;

  const box = new URL(req.url).searchParams.get("box") || "received";

  if (box === "sent") {
    const offers = await prisma.offer.findMany({
      where: { buyerId: userId },
      include: { listing: { select: { id: true, title: true, priceCents: true, status: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(offers);
  }

  const offers = await prisma.offer.findMany({
    where: { listing: { sellerId: userId } },
    include: {
      listing: { select: { id: true, title: true, priceCents: true, status: true } },
      buyer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(offers);
}

// POST /api/offers — submit an offer on a listing (requires sign-in)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to make an offer" }, { status: 401 });
  }

  const body = await req.json();
  const { listingId, amountCents, message } = body;

  if (!listingId || typeof amountCents !== "number" || amountCents <= 0) {
    return NextResponse.json({ error: "Enter a valid offer amount" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "active") {
    return NextResponse.json({ error: "This listing isn't available" }, { status: 404 });
  }

  const buyerId = (session.user as any).id;
  if (listing.sellerId === buyerId) {
    return NextResponse.json({ error: "You can't make an offer on your own listing" }, { status: 400 });
  }

  const offer = await prisma.offer.create({
    data: {
      listingId,
      buyerId,
      amountCents,
      message: message || null,
    },
  });

  await notify({
    userId: listing.sellerId,
    type: "OFFER_RECEIVED",
    title: `New offer on "${listing.title}"`,
    body: `${session.user.name || "A buyer"} offered $${(amountCents / 100).toLocaleString()}.`,
    link: `/inbox`,
  });

  return NextResponse.json(offer, { status: 201 });
}
