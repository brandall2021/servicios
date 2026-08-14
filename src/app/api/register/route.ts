import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  password: z
    .string()
    .min(8)
    .max(128)
    .refine((value) => /[A-Z]/.test(value), { message: "La contraseña debe incluir una mayúscula" })
    .refine((value) => /[0-9]/.test(value), { message: "La contraseña debe incluir un número" }),
  phone: z.string().max(50).optional(),
  role: z.enum(["CLIENT", "PROVIDER"]).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password, phone, role } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const solicitudProveedor = role === "PROVIDER"

    let user
    try {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "CLIENT",
          phone,
          solicitudProveedor,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email, role: user.role, solicitudProveedor },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    )
  }
}
