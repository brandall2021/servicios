import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { receptorId, chatId, contenido } = await req.json()

    if (chatId) {
      const mensaje = await prisma.mensaje.create({
        data: {
          contenido,
          chatId,
          emisorId: session.user.id,
          receptorId,
        },
      })
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      })
      return NextResponse.json(mensaje, { status: 201 })
    }

    if (!receptorId) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    let existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { creadorId: session.user.id, participanteId: receptorId },
          { creadorId: receptorId, participanteId: session.user.id },
        ],
      },
    })

    if (!existingChat) {
      existingChat = await prisma.chat.create({
        data: {
          creadorId: session.user.id,
          participanteId: receptorId,
        },
      })
    }

    return NextResponse.json(existingChat)
  } catch {
    return NextResponse.json({ error: "Error en el chat" }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const chats = await prisma.chat.findMany({
    where: {
      OR: [
        { creadorId: session.user.id },
        { participanteId: session.user.id },
      ],
    },
    include: {
      creador: { select: { id: true, name: true, image: true } },
      participante: { select: { id: true, name: true, image: true } },
      mensajes: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(chats)
}
