import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_REASONS = ["Scam", "Fake or misleading listing", "Prohibited item", "Trying to pay outside the app", "Spam", "Other"];

// POST /api/reports  { listingId, reason, details? }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const userId = (session.user as any).id;

  const { listingId, reason, details } = await req.json();
  if (!listingId || !VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "A listing and a valid reason are required" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const report = await prisma.report.create({
    data: { listingId, reporterId: userId, reason, details: details || null },
  });

  return NextResponse.json(report, { status: 201 });
}
