import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const chat = await prisma.chat.findUnique({ where: { id } })
  if (!chat) {
    return NextResponse.json({ error: "Chat no encontrado" }, { status: 404 })
  }

  if (chat.creadorId !== session.user.id && chat.participanteId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const mensajes = await prisma.mensaje.findMany({
    where: { chatId: id },
    orderBy: { createdAt: "asc" },
  })

  await prisma.mensaje.updateMany({
    where: { chatId: id, receptorId: session.user.id, leido: false },
    data: { leido: true },
  })

  return NextResponse.json(mensajes)
}
