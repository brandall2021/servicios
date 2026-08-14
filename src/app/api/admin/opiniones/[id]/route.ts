import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, PUBLIC_USER_SELECT } from "@/lib/auth-guard"
import { logAdminAction } from "@/lib/audit"

const updateOpinionSchema = z.object({
  comentario: z.string().max(2000).optional(),
  puntuacion: z.number().int().min(1).max(5).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const { id } = await params
  const body = await req.json()
  const parsed = updateOpinionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  let opinion
  try {
    opinion = await prisma.opinion.update({
      where: { id },
      data: parsed.data,
      include: {
        cliente: { select: PUBLIC_USER_SELECT },
        servicio: { select: { id: true, titulo: true } },
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Opinión no encontrada" }, { status: 404 })
    }
    throw error
  }

  await logAdminAction("editar_opinion", `Editada opinión de ${opinion.cliente.name} en ${opinion.servicio.titulo}`, id)

  return NextResponse.json(opinion)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const { id } = await params
  const opinion = await prisma.opinion.findUnique({
    where: { id },
    select: { cliente: { select: { name: true } }, servicio: { select: { titulo: true } } },
  })
  try {
    await prisma.opinion.delete({ where: { id } })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Opinión no encontrada" }, { status: 404 })
    }
    throw error
  }
  if (opinion) {
    await logAdminAction("eliminar_opinion", `Eliminada opinión de ${opinion.cliente.name} en ${opinion.servicio.titulo}`, id)
  }
  return NextResponse.json({ success: true })
}
