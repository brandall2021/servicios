import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ChatView } from "./chat-view"

interface Props {
  searchParams: Promise<{ proveedor?: string; servicio?: string }>
}

export default async function ChatPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const params = await searchParams

  const chats = await prisma.chat.findMany({
    where: {
      OR: [
        { creadorId: session.user.id },
        { participanteId: session.user.id },
      ],
    },
    include: {
      creador: true,
      participante: true,
      mensajes: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  const users = await prisma.user.findMany({
    where: { role: "PROVIDER", id: { not: session.user.id } },
    select: { id: true, name: true, image: true },
    take: 50,
  })

  const chatList = chats.map((chat) => {
    const otherUser =
      chat.creadorId === session.user.id ? chat.participante : chat.creador
    return {
      id: chat.id,
      otherUser,
      lastMessage: chat.mensajes[0] || null,
      updatedAt: chat.updatedAt,
    }
  })

  const initialChatId = params.proveedor ? undefined : chatList[0]?.id

  return (
    <div className="h-[calc(100vh-4rem)] max-w-6xl mx-auto flex">
      <ChatView
        currentUserId={session.user.id}
        chats={chatList as never[]}
        users={users as never[]}
        initialChatId={initialChatId}
        proveedorId={params.proveedor}
        servicioId={params.servicio}
      />
    </div>
  )
}
