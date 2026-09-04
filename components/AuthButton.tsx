"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-sm text-[#8A8378]">…</div>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#B8B1A3] hidden sm:inline">{session.user.name}</span>
        <button
          onClick={() => signOut()}
          className="text-sm border border-[#3A362F] px-3 py-1.5 rounded-md hover:border-[#544E44] transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="text-sm border border-[#3A362F] px-3 py-1.5 rounded-md hover:border-[#544E44] transition-colors"
    >
      Sign in
    </button>
  );
}
