import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

// Swap GoogleProvider for any NextAuth provider you prefer (GitHub, Email
// magic links, Apple, etc). Google is the simplest to set up for a first
// launch: https://next-auth.js.org/providers/google
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).stripeOnboarded = (user as any).stripeOnboarded;
      }
      return session;
    },
  },
};
