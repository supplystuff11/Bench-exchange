import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getShippingRate } from "@/lib/shippo";

// POST /api/shipping/rate  { listingId, toZip }
// Returns a real, live shipping rate for this specific listing to this
// specific ZIP code. Callers should re-request this right before checkout
// rather than reusing an old quote, since rates can change.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { listingId, toZip } = await req.json();
  if (!listingId || !toZip || !/^\d{5}$/.test(toZip)) {
    return NextResponse.json({ error: "Enter a valid 5-digit ZIP code" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || !listing.shipsAvailable || !listing.shipFromZip || !listing.weightLbs) {
    return NextResponse.json({ error: "This listing doesn't support shipping" }, { status: 400 });
  }

  const rate = await getShippingRate({
    fromZip: listing.shipFromZip,
    toZip,
    weightLbs: listing.weightLbs,
    packageSize: listing.packageSize || "medium",
  });

  if (!rate) {
    return NextResponse.json(
      { error: "Couldn't get a shipping rate for that ZIP code right now — try again or ask the seller" },
      { status: 502 }
    );
  }

  return NextResponse.json(rate);
}
