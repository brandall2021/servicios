import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"

const estadoSchema = z.object({
  estado: z.enum(["PENDIENTE", "REVISADO", "RECHAZADO"]),
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

  const report = await prisma.report.update({
    where: { id },
    data: { estado: parsed.data.estado },
  })

  return NextResponse.json(report)
}
