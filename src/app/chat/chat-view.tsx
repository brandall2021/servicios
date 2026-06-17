"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, MessageSquare } from "lucide-react"

interface ChatListProps {
  currentUserId: string
  chats: {
    id: string
    otherUser: { id: string; name: string; image: string | null }
    lastMessage: { contenido: string | null; createdAt: Date } | null
    updatedAt: Date
  }[]
  users: { id: string; name: string; image: string | null }[]
  initialChatId?: string
  proveedorId?: string
  servicioId?: string
}

interface Message {
  id: string
  contenido: string | null
  createdAt: string
  emisorId: string
  receptorId: string
  leido: boolean
}

export function ChatView({
  currentUserId,
  chats,
  users,
  initialChatId,
  proveedorId,
  servicioId,
}: ChatListProps) {
  const router = useRouter()
  const initialFromProvider = !initialChatId && proveedorId
    ? chats.find((c) => c.otherUser.id === proveedorId)?.id
    : undefined
  const [activeChatId, setActiveChatId] = useState<string | undefined>(initialChatId || initialFromProvider)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeChatId) return
    const id = activeChatId
    fetch(`/api/chat/${id}`).then((res) => {
      if (res.ok) res.json().then(setMessages)
    })
  }, [activeChatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !activeChatId) return

    const activeChat = chats.find((c) => c.id === activeChatId)
    if (!activeChat) return

    setSending(true)
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: activeChatId,
        receptorId: activeChat.otherUser.id,
        contenido: newMessage.trim(),
      }),
    })

    if (res.ok) {
      setNewMessage("")
      fetch(`/api/chat/${activeChatId}`).then((r) => {
        if (r.ok) r.json().then(setMessages)
      })
      router.refresh()
    }
    setSending(false)
  }

  async function handleNewChat(userId: string) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receptorId: userId,
        servicioId,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setActiveChatId(data.id)
      router.refresh()
    }
  }

  const activeChat = chats.find((c) => c.id === activeChatId)

  return (
    <>
      <div className="w-80 border-r border-zinc-200 flex flex-col">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="font-semibold text-zinc-900">Mensajes</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-zinc-50 transition-colors text-left ${
                  activeChatId === chat.id ? "bg-orange-50" : ""
                }`}
              >
                <Avatar src={chat.otherUser.image} fallback={chat.otherUser.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {chat.otherUser.name}
                  </p>
                  {chat.lastMessage && (
                    <p className="text-xs text-zinc-500 truncate">
                      {chat.lastMessage.contenido}
                    </p>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-sm text-zinc-400 text-center">
              Sin conversaciones
            </div>
          )}
        </div>
        <div className="p-4 border-t border-zinc-200">
          <p className="text-xs text-zinc-400 mb-2">Contactar proveedor:</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleNewChat(u.id)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 text-left text-sm"
              >
                <Avatar src={u.image} fallback={u.name} size="sm" />
                <span className="truncate text-zinc-700">{u.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 border-b border-zinc-200 flex items-center gap-3">
              <Avatar
                src={activeChat.otherUser.image}
                fallback={activeChat.otherUser.name}
                size="md"
              />
              <span className="font-medium text-zinc-900">
                {activeChat.otherUser.name}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.emisorId === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.emisorId === currentUserId
                        ? "bg-orange-600 text-white"
                        : "bg-zinc-100 text-zinc-900"
                    }`}
                  >
                    <p className="text-sm">{msg.contenido}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.emisorId === currentUserId
                          ? "text-orange-200"
                          : "text-zinc-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t border-zinc-200 flex gap-2">
              <Input
                id="message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribí un mensaje..."
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim() || sending} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3" />
              <p>Seleccioná una conversación</p>
              <p className="text-sm">o contactá a un proveedor</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
