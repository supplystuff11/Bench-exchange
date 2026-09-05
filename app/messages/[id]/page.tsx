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
          <h1 className="text-xl font-bold text-[var(--text-1)]">{otherPerson.name || "User"}</h1>
        </div>
        <MessageThread conversationId={conversation.id} currentUserId={userId} />
      </main>
    </div>
  );
}
