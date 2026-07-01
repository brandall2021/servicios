import { NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6).max(100),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = resetSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const { token, password } = parsed.data
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: { gt: new Date() },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  })

  return NextResponse.json({ message: "Contraseña actualizada correctamente" })
}