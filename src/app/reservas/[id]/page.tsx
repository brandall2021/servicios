import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { BookingStatus } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookingActions } from "@/components/shared/booking-actions"

interface Props {
  params: Promise<{ id: string }>
}

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
  CANCELLED_BY_CLIENT: "Cancelada por cliente",
  CANCELLED_BY_PROVIDER: "Cancelada por proveedor",
  COMPLETED: "Completada",
  NO_SHOW: "No show",
}

export default async function BookingDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect(`/login?returnTo=${encodeURIComponent("/reservas")}`)

  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, title: true, slug: true, type: true } },
      client: { select: { id: true, name: true, image: true, email: true } },
      provider: { select: { id: true, name: true, image: true, email: true } },
    },
  })

  if (!booking) notFound()

  const isClient = booking.clientId === session.user.id
  const isProvider = booking.providerId === session.user.id
  const isAdmin = session.user.role === "ADMIN"
  if (!isClient && !isProvider && !isAdmin) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Reserva</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Detalle del turno</h1>
        </div>
        <Link href="/reservas">
          <Button variant="outline" className="rounded-xl">Volver a reservas</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{statusLabels[booking.status]}</Badge>
              <Badge variant="outline">{booking.listing.type === "SERVICE" ? "Servicio" : "Producto"}</Badge>
              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{booking.listing.title}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Inicio" value={new Date(booking.startsAt).toLocaleString("es-AR")} />
              <Info label="Fin" value={new Date(booking.endsAt).toLocaleString("es-AR")} />
              <Info label="Zona horaria" value={booking.timezone} />
              <Info label="ID" value={booking.id} mono />
            </div>

            {booking.notes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Notas</p>
                <p className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-300 whitespace-pre-line">{booking.notes}</p>
              </div>
            )}

            {booking.cancellationReason && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Motivo de cancelación</p>
                <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-300 whitespace-pre-line">{booking.cancellationReason}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Link href={`/servicios/${booking.listing.id}`}>
                <Button variant="outline" className="rounded-xl">Ver publicación</Button>
              </Link>
              <Link href={`/chat?proveedor=${booking.providerId}`}>
                <Button variant="outline" className="rounded-xl">Abrir chat</Button>
              </Link>
            </div>

            <BookingActions id={booking.id} status={booking.status} isClient={isClient} isProvider={isProvider} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Cliente</p>
                <p className="font-medium text-stone-900 dark:text-stone-100">{booking.client.name}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">{booking.client.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Proveedor</p>
                <p className="font-medium text-stone-900 dark:text-stone-100">{booking.provider.name}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">{booking.provider.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">Resumen</p>
              <p className="text-sm text-stone-600 dark:text-stone-300">Estado actual: <span className="font-medium text-stone-900 dark:text-stone-100">{statusLabels[booking.status]}</span></p>
              <p className="text-sm text-stone-600 dark:text-stone-300">Turno creado para <span className="font-medium text-stone-900 dark:text-stone-100">{booking.providerId === session.user.id ? "tu agenda" : "tu solicitud"}</span>.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1">{label}</p>
      <p className={`text-sm font-medium text-stone-900 dark:text-stone-100 ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</p>
    </div>
  )
}
