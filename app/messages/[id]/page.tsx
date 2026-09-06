import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import MessageThread from "@/components/MessageThread";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/api/auth/signin?callbackUrl=/messages/${params.id}`);
  const userId = (session.user as any).id;

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      listing: { select: { id: true, title: true } },
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
    },
  });
  if (!conversation) return notFound();
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) return notFound();

  const otherPerson = conversation.buyerId === userId ? conversation.seller : conversation.buyer;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-8 flex flex-col">
        <div className="mb-4">
          <p className="text-xs text-[var(--text-4)]">{conversation.listing.title}</p>
          <Link href={`/profile/${otherPerson.id}`} className="text-xl font-bold text-[var(--text-1)] hover:text-[var(--accent-text)] transition-colors">
            {otherPerson.name || "User"}
          </Link>
        </div>
        <div className="bg-[var(--accent-soft-bg)] border border-[var(--accent-fill)]/30 rounded-lg px-3 py-2 mb-3 text-xs text-[var(--text-2)]">
          Complete purchases through <strong>Buy Now</strong> or <strong>Make an Offer</strong> —
          payments outside Voltra aren't protected and violate our{" "}
          <a href="/terms" className="underline">Terms of Service</a>.
        </div>
        <MessageThread conversationId={conversation.id} currentUserId={userId} />
      </main>
    </div>
  );
}
