import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"
import { logAdminAction } from "@/lib/audit"

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

  let servicio
  try {
    servicio = await prisma.servicio.update({
      where: { id },
      data: parsed.data,
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }
    throw error
  }

  if (Object.keys(parsed.data).length === 1 && typeof parsed.data.activo === "boolean") {
    await logAdminAction(parsed.data.activo ? "activar_servicio" : "desactivar_servicio", `${parsed.data.activo ? "Activado" : "Desactivado"} servicio ${servicio.titulo}`, id)
  } else {
    await logAdminAction("editar_servicio", `Editado servicio ${servicio.titulo}`, id)
  }

  return NextResponse.json(servicio)
}
