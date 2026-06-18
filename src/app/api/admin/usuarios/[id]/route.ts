import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return false
  }
  return true
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const data: Record<string, any> = {}
  if (typeof body.verified === "boolean") data.verified = body.verified
  if (typeof body.baneado === "boolean") {
    data.baneado = body.baneado
    data.motivoBaneo = body.motivoBaneo || null
  }
  if (body.role && ["CLIENT", "PROVIDER", "ADMIN"].includes(body.role)) {
    data.role = body.role
  }
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim()
  if (typeof body.email === "string" && body.email.trim()) data.email = body.email.trim()
  if (typeof body.phone === "string") data.phone = body.phone || null

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, verified: true, baneado: true, motivoBaneo: true },
  })

  return NextResponse.json(user)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
