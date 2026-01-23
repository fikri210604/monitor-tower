import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/signin",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username,
          },
        });

        if (!user) {
          return null;
        }

        const { isBcryptHash, decrypt } = await import("@/lib/crypto");
        let passwordMatch = false;

        try {
          if (isBcryptHash(user.password)) {
            // Legacy Bcrypt
            passwordMatch = await bcrypt.compare(credentials.password, user.password);
          } else {
            // New AES
            const decrypted = decrypt(user.password);
            passwordMatch = credentials.password === decrypted;
          }
        } catch (error) {
          console.error("Auth Error:", error);
          return null;
        }

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.username, // aman untuk NextAuth
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);
