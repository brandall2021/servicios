import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return false
  return true
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const data: Record<string, any> = {}

  if (typeof body.comentario === "string") data.comentario = body.comentario
  if (typeof body.puntuacion === "number") data.puntuacion = body.puntuacion

  const opinion = await prisma.opinion.update({
    where: { id },
    data,
    include: {
      cliente: { select: { id: true, name: true } },
      servicio: { select: { id: true, titulo: true } },
    },
  })

  return NextResponse.json(opinion)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  await prisma.opinion.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
