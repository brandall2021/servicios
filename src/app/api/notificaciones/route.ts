import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const notificaciones = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const noLeidas = notificaciones.filter((n) => !n.read).length

    return NextResponse.json({ notificaciones, noLeidas })
  } catch {
    return NextResponse.json({ error: "Error al obtener notificaciones" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await req.json()

    if (id === "todas") {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      })
    } else {
      const result = await prisma.notification.updateMany({
        where: { id, userId: session.user.id },
        data: { read: true },
      })
      if (result.count === 0) {
        return NextResponse.json({ error: "Notificación no encontrada" }, { status: 404 })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al actualizar notificación" }, { status: 500 })
  }
}
