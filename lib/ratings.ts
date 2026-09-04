import { prisma } from "./prisma";

export async function getRatings(userId: string) {
  const [sellerAgg, buyerAgg] = await Promise.all([
    prisma.review.aggregate({
      where: { targetId: userId, role: "SELLER" },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.review.aggregate({
      where: { targetId: userId, role: "BUYER" },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  return {
    seller: { avg: sellerAgg._avg.rating || 0, count: sellerAgg._count },
    buyer: { avg: buyerAgg._avg.rating || 0, count: buyerAgg._count },
  };
}
