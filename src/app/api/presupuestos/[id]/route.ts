import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  try {
    const request = await prisma.budgetRequest.findUnique({
      where: { id },
      include: {
        servicio: {
          include: { usuario: { select: { id: true, name: true, image: true, phone: true } } },
        },
        cliente: { select: { id: true, name: true, image: true } },
        cotizaciones: {
          orderBy: { version: "desc" },
          include: { proveedor: { select: { id: true, name: true, image: true } } },
        },
      },
    })

    if (!request) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    const isOwner = request.clienteId === session.user.id
    const isProvider = request.servicio.usuarioId === session.user.id
    if (!isOwner && !isProvider) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    return NextResponse.json(request)
  } catch {
    return NextResponse.json({ error: "Error al obtener solicitud" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ["PENDIENTE", "COTIZADO", "ACEPTADO", "RECHAZADO", "REVISION"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  try {
    const request = await prisma.budgetRequest.findUnique({ where: { id } })
    if (!request) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    const isOwner = request.clienteId === session.user.id
    const isProvider = (await prisma.servicio.findUnique({ where: { id: request.servicioId } }))?.usuarioId === session.user.id
    if (!isOwner && !isProvider) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const updated = await prisma.budgetRequest.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}
