import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"
import { logAdminAction } from "@/lib/audit"

const estadoSchema = z.object({
  estado: z.enum(["PENDIENTE", "REVISADO", "RESUELTO"]),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const { id } = await params
  const body = await req.json()
  const parsed = estadoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  let report
  try {
    report = await prisma.report.update({
      where: { id },
      data: { estado: parsed.data.estado },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Denuncia no encontrada" }, { status: 404 })
    }
    throw error
  }

  await logAdminAction("editar_denuncia", `Denuncia ${id} marcada como ${parsed.data.estado}`, id)

  return NextResponse.json(report)
}
