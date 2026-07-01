import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

async function checkBaneado(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { baneado: true, motivoBaneo: true },
    })
    return user?.baneado === true
  } catch {
    return false
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const baneado = await checkBaneado(email)
        if (baneado) return null

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
    Google,
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const baneado = await checkBaneado(user.email)
        if (baneado) return false
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      if (token.email) {
        const baneado = await checkBaneado(token.email as string)
        if (baneado) {
          token.role = "BANEADO"
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.role === "BANEADO") {
          session.user.role = "BANEADO"
        } else {
          session.user.role = token.role as string
        }
        session.user.id = token.id as string
      }
      return session
    },
  },
})
