import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { servicioId, puntuacion, comentario } = await req.json()

    if (!servicioId || !puntuacion || puntuacion < 1 || puntuacion > 5) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      )
    }

    const existing = await prisma.opinion.findFirst({
      where: { servicioId, clienteId: session.user.id },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Ya calificaste este servicio" },
        { status: 400 }
      )
    }

    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId },
    })

    if (!servicio || servicio.usuarioId === session.user.id) {
      return NextResponse.json(
        { error: "No podés calificar tu propio servicio" },
        { status: 400 }
      )
    }

    const opinion = await prisma.opinion.create({
      data: {
        puntuacion,
        comentario,
        servicioId,
        clienteId: session.user.id,
      },
    })

    return NextResponse.json(opinion, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear opinión" }, { status: 500 })
  }
}
