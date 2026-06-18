import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return false
  }
  return true
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, password, role, phone, verified } = body

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

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
      role: role || "CLIENT",
      phone: phone || null,
      verified: verified || false,
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
