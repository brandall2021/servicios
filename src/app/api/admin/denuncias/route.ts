import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { requireAdmin, PUBLIC_USER_SELECT } from "@/lib/auth-guard"
import { ReportMotivo } from "@prisma/client"

const createReportSchema = z.object({
  motivo: z.nativeEnum(ReportMotivo),
  descripcion: z.string().max(2000).optional(),
  servicioId: z.string().optional(),
  opinionId: z.string().optional(),
  usuarioId: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Motivo es requerido" }, { status: 400 })
  }

  const { motivo, descripcion, servicioId, opinionId, usuarioId } = parsed.data

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
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const reports = await prisma.report.findMany({
    include: {
      denunciante: { select: PUBLIC_USER_SELECT },
      servicio: { select: { id: true, titulo: true, activo: true } },
      opinion: { select: { id: true, comentario: true, puntuacion: true } },
      usuario: { select: PUBLIC_USER_SELECT },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(reports)
}
