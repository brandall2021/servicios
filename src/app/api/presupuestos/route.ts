import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { servicioId, description, materiales, archivos } = await req.json()
    if (!servicioId) {
      return NextResponse.json({ error: "Falta el servicio" }, { status: 400 })
    }

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
        servicio: { include: { usuario: { select: { id: true, name: true, image: true } } } },
      },
    })

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
        cliente: { select: { id: true, name: true, image: true } },
        cotizaciones: {
          orderBy: { version: "desc" },
          take: 1,
          include: { proveedor: { select: { id: true, name: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch {
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
  }
}
