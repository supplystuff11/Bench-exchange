import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import EditListingForm from "@/components/EditListingForm";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/listing/${params.id}/edit`);
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) notFound();
  if (listing.sellerId !== (session.user as any).id) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-10">
        <h1 className="text-xl font-bold mb-1.5">Edit listing</h1>
        <p className="text-sm text-[#736C5F] mb-6">Update the details buyers will see.</p>
        <EditListingForm listing={listing} />
      </main>
    </div>
  );
}
