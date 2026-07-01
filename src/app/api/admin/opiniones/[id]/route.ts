import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, PUBLIC_USER_SELECT } from "@/lib/auth-guard"

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

  const opinion = await prisma.opinion.update({
    where: { id },
    data: parsed.data,
    include: {
      cliente: { select: PUBLIC_USER_SELECT },
      servicio: { select: { id: true, titulo: true } },
    },
  })

  return NextResponse.json(opinion)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const { id } = await params
  await prisma.opinion.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
