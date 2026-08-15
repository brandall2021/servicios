import { BookingStatus, ListingStatus, ListingType } from "@prisma/client"
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseDateTime } from "@/lib/marketplace/bookings"
import { logCommercialEvent } from "@/lib/commercial-events"

const createSchema = z.object({
  listingId: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  timezone: z.string().min(1),
  notes: z.string().max(1000).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where: { OR: [{ clientId: session.user.id }, { providerId: session.user.id }] },
    include: {
      listing: { select: { id: true, title: true, slug: true, type: true } },
      client: { select: { id: true, name: true, image: true } },
      provider: { select: { id: true, name: true, image: true } },
    },
    orderBy: { startsAt: "asc" },
  })

  return NextResponse.json(bookings)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { service: true, provider: true },
  })
  if (!listing || listing.type !== ListingType.SERVICE || listing.status !== ListingStatus.PUBLISHED) {
    return NextResponse.json({ error: "Servicio no disponible" }, { status: 404 })
  }

  const startsAt = parseDateTime(parsed.data.startsAt)
  const endsAt = parseDateTime(parsed.data.endsAt)
  if (startsAt >= endsAt) return NextResponse.json({ error: "Horario inválido" }, { status: 400 })
  if (startsAt < new Date()) return NextResponse.json({ error: "No podés reservar en el pasado" }, { status: 400 })

  const overlapping = await prisma.booking.findFirst({
    where: {
      providerId: listing.providerId,
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  })
  if (overlapping) return NextResponse.json({ error: "Ese horario ya no está disponible" }, { status: 409 })

  const booking = await prisma.booking.create({
    data: {
      listingId: listing.id,
      clientId: session.user.id,
      providerId: listing.providerId,
      startsAt,
      endsAt,
      timezone: parsed.data.timezone,
      notes: parsed.data.notes || null,
    },
  })

  await logCommercialEvent({
    type: "BOOKING_CREATED",
    userId: session.user.id,
    sessionId: session.user.id,
    providerId: listing.providerId,
    listingId: listing.id,
    requestId: booking.id,
    metadata: { startsAt: booking.startsAt.toISOString(), endsAt: booking.endsAt.toISOString(), timezone: booking.timezone },
  })

  return NextResponse.json(booking, { status: 201 })
}
