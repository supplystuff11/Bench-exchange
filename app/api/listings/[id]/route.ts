import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { seller: { select: { name: true, id: true } } },
  });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  return NextResponse.json(listing);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (listing.sellerId !== (session.user as any).id) {
    return NextResponse.json({ error: "You can only edit your own listings" }, { status: 403 });
  }

  const body = await req.json();
  const { title, category, brand, condition, priceCents, city, specs, description, imageUrls, videoUrls } = body;

  if (!title || !category || !condition || !priceCents || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (typeof priceCents !== "number" || priceCents <= 0) {
    return NextResponse.json({ error: "Price must be a positive number of cents" }, { status: 400 });
  }

  const updated = await prisma.listing.update({
    where: { id: params.id },
    data: {
      title,
      category,
      brand: brand || "Other",
      condition,
      priceCents,
      city,
      specs,
      description,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      videoUrls: Array.isArray(videoUrls) ? videoUrls : [],
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (listing.sellerId !== (session.user as any).id) {
    return NextResponse.json({ error: "You can only remove your own listings" }, { status: 403 });
  }

  await prisma.listing.update({ where: { id: params.id }, data: { status: "removed" } });
  return NextResponse.json({ ok: true });
}
