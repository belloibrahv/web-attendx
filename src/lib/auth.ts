import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: { 
    signIn: "/login",
    error: "/login",
    signOut: "/home",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password) return null;

          const user = await db.user.findUnique({
            where: { email: credentials.email },
            select: { id: true, email: true, passwordHash: true, role: true },
          });
          
          if (!user) return null;

          const passwordOk = await compare(credentials.password, user.passwordHash);
          if (!passwordOk) return null;

          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.role = (user as { role?: Role }).role;
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        // Return a minimal token to prevent complete failure
        return { sub: token.sub };
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token.sub) {
          session.user.id = token.sub;
          session.user.role = (token.role as "ADMIN" | "LECTURER" | "STUDENT") ?? "STUDENT";
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        // Return minimal session to prevent complete failure
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub || "",
            role: "STUDENT" as const,
          },
        };
      }
    },
  },
  events: {
    async signOut() {
      // Clear any cached data on signout
    },
    async signIn({ user, account, profile, isNewUser }) {
      // Log successful sign ins
      console.log("User signed in:", user.email);
    },
  },
  // Only enable debug in development
  debug: process.env.NODE_ENV === "development",
  // Add secret explicitly
  secret: process.env.NEXTAUTH_SECRET,
  // Add JWT configuration to handle errors better
  jwt: {
    // Reduce max age to prevent long-lived problematic tokens
    maxAge: 24 * 60 * 60, // 24 hours
  },
};
