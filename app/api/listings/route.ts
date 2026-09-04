import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

// GET /api/listings?category=GPU&search=4070&sort=newest
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";

  const listings = await prisma.listing.findMany({
    where: {
      status: "active",
      ...(category && category !== "All" ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { specs: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { seller: { select: { name: true, id: true } } },
    orderBy:
      sort === "price-low"
        ? { priceCents: "asc" }
        : sort === "price-high"
        ? { priceCents: "desc" }
        : { createdAt: "desc" },
  });

  return NextResponse.json(listings);
}

// POST /api/listings — create a new listing (requires sign-in)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to create a listing" }, { status: 401 });
  }

  const body = await req.json();
  const { title, category, brand, condition, priceCents, city, specs, description, imageUrls, videoUrls } = body;

  if (!title || !category || !condition || !priceCents || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (typeof priceCents !== "number" || priceCents <= 0) {
    return NextResponse.json({ error: "Price must be a positive number of cents" }, { status: 400 });
  }

  const listing = await prisma.listing.create({
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
      sellerId: (session.user as any).id,
    },
  });

  // Notify anyone whose saved search matches this new listing.
  const searches = await prisma.savedSearch.findMany({
    where: { userId: { not: (session.user as any).id } },
  });
  const matchingUserIds = new Set<string>();
  for (const s of searches) {
    if (s.category && s.category !== listing.category) continue;
    if (s.brand && s.brand !== listing.brand) continue;
    if (s.search && !listing.title.toLowerCase().includes(s.search.toLowerCase())) continue;
    if (s.minPrice != null && listing.priceCents < s.minPrice) continue;
    if (s.maxPrice != null && listing.priceCents > s.maxPrice) continue;
    matchingUserIds.add(s.userId);
  }
  for (const uid of matchingUserIds) {
    await notify({
      userId: uid,
      type: "SAVED_SEARCH_MATCH",
      title: `New match: "${listing.title}"`,
      body: `$${(listing.priceCents / 100).toLocaleString()} · ${listing.brand} · ${listing.category}`,
      link: `/listing/${listing.id}`,
    });
  }

  return NextResponse.json(listing, { status: 201 });
}
