import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { requireAdmin } from "@/lib/auth-guard"

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(["CLIENT", "PROVIDER", "ADMIN"]).optional().default("CLIENT"),
  phone: z.string().max(30).nullable().optional(),
  verified: z.boolean().optional().default(false),
})

export async function POST(req: Request) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const body = await req.json()
  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const { name, email, password, role, phone, verified } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || null,
      verified,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      verified: true,
      createdAt: true,
    },
  })

  return NextResponse.json(user, { status: 201 })
}
