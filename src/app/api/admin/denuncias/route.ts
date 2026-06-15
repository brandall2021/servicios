import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { motivo, descripcion, servicioId, opinionId, usuarioId } = await req.json()

  if (!motivo) {
    return NextResponse.json({ error: "Motivo es requerido" }, { status: 400 })
  }

  const report = await prisma.report.create({
    data: {
      motivo,
      descripcion,
      denuncianteId: session.user.id,
      servicioId,
      opinionId,
      usuarioId,
    },
  })

  return NextResponse.json(report, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const reports = await prisma.report.findMany({
    include: {
      denunciante: { select: { id: true, name: true } },
      servicio: { select: { id: true, titulo: true, activo: true } },
      opinion: { select: { id: true, comentario: true, puntuacion: true } },
      usuario: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(reports)
}
