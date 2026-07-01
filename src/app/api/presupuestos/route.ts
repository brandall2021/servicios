import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PUBLIC_USER_SELECT } from "@/lib/auth-guard"
import { notifyNewBudgetRequest } from "@/lib/notifications"

const createPresupuestoSchema = z.object({
  servicioId: z.string().min(1),
  description: z.string().max(5000).optional(),
  materiales: z.string().max(5000).optional(),
  archivos: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = createPresupuestoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Falta el servicio" }, { status: 400 })
    }

    const { servicioId, description, materiales, archivos } = parsed.data

    const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } })
    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }
    if (servicio.usuarioId === session.user.id) {
      return NextResponse.json({ error: "No podés solicitar presupuesto a tu propio servicio" }, { status: 400 })
    }

    const request = await prisma.budgetRequest.create({
      data: {
        description,
        materiales,
        archivos: archivos || null,
        servicioId,
        clienteId: session.user.id,
      },
      include: {
        servicio: { include: { usuario: { select: PUBLIC_USER_SELECT } } },
      },
    })

    await notifyNewBudgetRequest(servicioId, servicio.titulo, servicio.usuarioId)

    return NextResponse.json(request, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear solicitud" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const rol = searchParams.get("rol") || "cliente"

  try {
    const where = rol === "proveedor"
      ? { servicio: { usuarioId: session.user.id } }
      : { clienteId: session.user.id }

    const requests = await prisma.budgetRequest.findMany({
      where,
      include: {
        servicio: {
          select: { id: true, titulo: true, categoria: true },
        },
        cliente: { select: PUBLIC_USER_SELECT },
        cotizaciones: {
          orderBy: { version: "desc" },
          take: 1,
          include: { proveedor: { select: PUBLIC_USER_SELECT } },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch {
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
  }
}
