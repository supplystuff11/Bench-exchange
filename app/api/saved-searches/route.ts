import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/saved-searches
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const userId = (session.user as any).id;

  const searches = await prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(searches);
}

// POST /api/saved-searches  { category?, brand?, search?, minPrice?, maxPrice? }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const userId = (session.user as any).id;

  const { category, brand, search, minPrice, maxPrice } = await req.json();
  if (!category && !brand && !search) {
    return NextResponse.json({ error: "Add at least a category, brand, or search term" }, { status: 400 });
  }

  const saved = await prisma.savedSearch.create({
    data: {
      userId,
      category: category || null,
      brand: brand || null,
      search: search || null,
      minPrice: minPrice ?? null,
      maxPrice: maxPrice ?? null,
    },
  });
  return NextResponse.json(saved, { status: 201 });
}
