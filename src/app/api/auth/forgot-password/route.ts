import { NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

const forgotSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = forgotSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 })
  }

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return NextResponse.json({ message: "Si el email existe, recibirás un enlace de recuperación" })
  }

  const rawToken = crypto.randomBytes(32).toString("hex")
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hora
    },
  })

  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`

  console.log(`[PASSWORD RESET] Enlace para ${email}: ${resetUrl}`)

  return NextResponse.json({
    message: "Si el email existe, recibirás un enlace de recuperación",
    ...(process.env.NODE_ENV === "development" && { resetUrl }),
  })
}