import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"
import { logAdminAction } from "@/lib/audit"

const updateUserSchema = z.object({
  verified: z.boolean().optional(),
  baneado: z.boolean().optional(),
  motivoBaneo: z.string().max(500).nullable().optional(),
  role: z.enum(["CLIENT", "PROVIDER", "ADMIN"]).optional(),
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).nullable().optional(),
  solicitudProveedor: z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const { id } = await params
  const body = await req.json()
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const antes = await prisma.user.findUnique({
    where: { id },
    select: { name: true, role: true, verified: true, baneado: true, solicitudProveedor: true },
  })
  if (!antes) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, verified: true, baneado: true, motivoBaneo: true },
  })

  // Audit
  if (parsed.data.role && parsed.data.role !== antes.role) {
    await logAdminAction("cambio_rol", `Rol de ${antes.name}: ${antes.role} → ${parsed.data.role}`, id)
  }
  if (parsed.data.baneado === true && !antes.baneado) {
    await logAdminAction("banear", `Bloqueado ${antes.name}${parsed.data.motivoBaneo ? ` — ${parsed.data.motivoBaneo}` : ""}`, id)
  }
  if (parsed.data.baneado === false && antes.baneado) {
    await logAdminAction("desbanear", `Desbloqueado ${antes.name}`, id)
  }
  if (parsed.data.solicitudProveedor === false && antes.solicitudProveedor === true && user.role === "PROVIDER") {
    await logAdminAction("aprobar_proveedor", `Aprobado ${antes.name} como proveedor`, id)
  }
  if (parsed.data.solicitudProveedor === false && antes.solicitudProveedor === true && user.role === "CLIENT") {
    await logAdminAction("rechazar_proveedor", `Rechazada solicitud de ${antes.name}`, id)
  }

  return NextResponse.json(user)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, email: true },
  })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  await prisma.user.delete({ where: { id } })

  await logAdminAction("eliminar", `Eliminado ${user.name} (${user.email})`, id)

  return NextResponse.json({ success: true })
}
