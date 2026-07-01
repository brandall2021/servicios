import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notifyNewMessage } from "@/lib/notifications"

const mensajeSchema = z.object({
  receptorId: z.string().min(1).optional(),
  chatId: z.string().min(1).optional(),
  contenido: z.string().max(5000).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = mensajeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const { receptorId, chatId, contenido } = parsed.data

    if (chatId) {
      const chat = await prisma.chat.findUnique({ where: { id: chatId } })
      if (!chat) {
        return NextResponse.json({ error: "Chat no encontrado" }, { status: 404 })
      }
      if (chat.creadorId !== session.user.id && chat.participanteId !== session.user.id) {
        return NextResponse.json({ error: "No pertenecés a este chat" }, { status: 403 })
      }
      const receptor = receptorId || (chat.creadorId === session.user.id ? chat.participanteId : chat.creadorId)
      const mensaje = await prisma.mensaje.create({
        data: {
          contenido,
          chatId,
          emisorId: session.user.id,
          receptorId: receptor,
        },
      })
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      })
      await notifyNewMessage(chatId, session.user.id, receptor, contenido || "")
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
