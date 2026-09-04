import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/api/auth/signin?callbackUrl=/messages");
  const userId = (session.user as any).id;

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      listing: { select: { id: true, title: true, imageUrls: true } },
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-10">
        <h1 className="text-xl font-bold mb-6">Messages</h1>

        {conversations.length === 0 ? (
          <p className="text-sm text-[#736C5F]">No conversations yet — message a seller from any listing.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((c) => {
              const otherPerson = c.buyerId === userId ? c.seller : c.buyer;
              const lastMessage = c.messages[0];
              return (
                <Link
                  key={c.id}
                  href={`/messages/${c.id}`}
                  className="flex items-center gap-3 bg-[#211F1B] border border-[#3A362F] rounded-xl p-3.5 hover:border-[#544E44] transition-colors"
                >
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#2B2822] to-[#1C1A16] shrink-0 overflow-hidden">
                    {c.listing.imageUrls.length > 0 && (
                      <img src={c.listing.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{otherPerson.name || "User"}</span>
                      <span className="text-xs text-[#736C5F] truncate">· {c.listing.title}</span>
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-[#736C5F] truncate">{lastMessage.body}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
