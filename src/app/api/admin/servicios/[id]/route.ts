import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"

const updateServicioSchema = z.object({
  activo: z.boolean().optional(),
  titulo: z.string().min(2).max(200).optional(),
  descripcion: z.string().min(2).max(5000).optional(),
  categoria: z.string().min(1).max(100).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const { id } = await params
  const body = await req.json()
  const parsed = updateServicioSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const servicio = await prisma.servicio.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(servicio)
}
