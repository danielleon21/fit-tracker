import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@fit-tracker/database";
import { authService } from "@/services/auth.service";

export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days, in seconds

const useSecureCookies = (process.env.NEXTAUTH_URL ?? "").startsWith("https://");
const cookieDomain = process.env.AUTH_COOKIE_DOMAIN?.trim() || undefined;

/**
 * Single source of truth for the session cookie, shared by NextAuth and by the
 * custom `POST /api/auth/login` route so both emit/read the exact same cookie.
 */
export const sessionCookie = {
  name: `${useSecureCookies ? "__Secure-" : ""}next-auth.session-token`,
  options: {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: useSecureCookies,
    domain: cookieDomain,
  },
} as const;

export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return secret;
}

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  cookies: {
    sessionToken: {
      name: sessionCookie.name,
      options: { ...sessionCookie.options },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await authService.validateCredentials(
            credentials.email,
            credentials.password,
          );
          return { id: user.id, email: user.email, name: user.name };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
};
