import { BookingStatus } from "@prisma/client"
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{ id: string }>
}

const patchSchema = z.object({
  action: z.enum(["CONFIRM", "REJECT", "CANCEL", "COMPLETE", "NO_SHOW"]),
  cancellationReason: z.string().max(500).optional().nullable(),
})

export async function PATCH(req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const isClient = booking.clientId === session.user.id
  const isProvider = booking.providerId === session.user.id
  const isAdmin = session.user.role === "ADMIN"
  if (!isClient && !isProvider && !isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  let status: BookingStatus
  switch (parsed.data.action) {
    case "CONFIRM":
      if (!isProvider && !isAdmin) return NextResponse.json({ error: "Solo el proveedor puede confirmar" }, { status: 403 })
      status = BookingStatus.CONFIRMED
      break
    case "REJECT":
      if (!isProvider && !isAdmin) return NextResponse.json({ error: "Solo el proveedor puede rechazar" }, { status: 403 })
      status = BookingStatus.REJECTED
      break
    case "CANCEL":
      if (!isClient && !isAdmin) return NextResponse.json({ error: "Solo el cliente puede cancelar" }, { status: 403 })
      status = isClient ? BookingStatus.CANCELLED_BY_CLIENT : BookingStatus.CANCELLED_BY_PROVIDER
      break
    case "COMPLETE":
      if (!isProvider && !isAdmin) return NextResponse.json({ error: "Solo el proveedor puede completar" }, { status: 403 })
      status = BookingStatus.COMPLETED
      break
    case "NO_SHOW":
      if (!isProvider && !isAdmin) return NextResponse.json({ error: "Solo el proveedor puede marcar no-show" }, { status: 403 })
      status = BookingStatus.NO_SHOW
      break
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status,
      cancellationReason: parsed.data.cancellationReason ?? undefined,
    },
  })

  return NextResponse.json(updated)
}
