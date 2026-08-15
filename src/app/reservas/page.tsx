import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookingActions } from "@/components/shared/booking-actions"
import { BookingStatus } from "@prisma/client"

const statusOptions = [
  { value: "ALL", label: "Todas" },
  { value: BookingStatus.PENDING, label: "Pendientes" },
  { value: BookingStatus.CONFIRMED, label: "Confirmadas" },
  { value: BookingStatus.REJECTED, label: "Rechazadas" },
  { value: BookingStatus.CANCELLED_BY_CLIENT, label: "Canceladas por cliente" },
  { value: BookingStatus.CANCELLED_BY_PROVIDER, label: "Canceladas por proveedor" },
  { value: BookingStatus.COMPLETED, label: "Completadas" },
  { value: BookingStatus.NO_SHOW, label: "No show" },
] as const

function statusLabel(status: string) {
  return statusOptions.find((option) => option.value === status)?.label || status
}

interface Props {
  searchParams: Promise<{ estado?: string }>
}

export default async function ReservasPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect(`/login?returnTo=${encodeURIComponent("/reservas")}`)

  const params = await searchParams
  const selectedStatus = statusOptions.some((option) => option.value === params.estado) ? params.estado : "ALL"

  const bookings = await prisma.booking.findMany({
    where: { OR: [{ clientId: session.user.id }, { providerId: session.user.id }] },
    include: {
      listing: { select: { id: true, title: true, slug: true, type: true } },
      client: { select: { id: true, name: true, image: true } },
      provider: { select: { id: true, name: true, image: true } },
    },
    orderBy: { startsAt: "asc" },
  })

  const filteredBookings = selectedStatus === "ALL" ? bookings : bookings.filter((booking) => booking.status === selectedStatus)
  const asClient = filteredBookings.filter((booking) => booking.clientId === session.user.id)
  const asProvider = filteredBookings.filter((booking) => booking.providerId === session.user.id)
  const counts = Object.fromEntries(statusOptions.map((option) => [option.value, option.value === "ALL" ? bookings.length : bookings.filter((booking) => booking.status === option.value).length]))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Agenda</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Reservas</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Tus turnos y solicitudes de servicio.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <Link key={option.value} href={option.value === "ALL" ? "/reservas" : `/reservas?estado=${option.value}`}>
            <Button
              variant={selectedStatus === option.value ? "default" : "outline"}
              className="rounded-xl"
            >
              {option.label}
              <span className="ml-2 text-xs opacity-70">{counts[option.value]}</span>
            </Button>
          </Link>
        ))}
      </div>

      <div className="grid gap-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">Solicitadas por vos</h2>
          <div className="grid gap-4">
            {asClient.length > 0 ? asClient.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{booking.status}</Badge>
                        <Badge variant="outline">{booking.listing.type === "SERVICE" ? "Servicio" : "Producto"}</Badge>
                        <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{booking.listing.title}</span>
                      </div>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {new Date(booking.startsAt).toLocaleString("es-AR")} - {new Date(booking.endsAt).toLocaleTimeString("es-AR")} · {booking.timezone}
                      </p>
                      {booking.notes && <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 whitespace-pre-line">{booking.notes}</p>}
                    </div>
                    <Link href={`/servicios/${booking.listing.id}`}>
                      <Button variant="outline" className="rounded-xl">Ver servicio</Button>
                    </Link>
                  </div>
                  <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">Estado: {statusLabel(booking.status)} · Proveedor: {booking.provider.name}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/reservas/${booking.id}`}>
                      <Button variant="outline" className="rounded-xl">Ver detalle</Button>
                    </Link>
                  </div>
                  <BookingActions id={booking.id} status={booking.status} isClient isProvider={false} />
                </CardContent>
              </Card>
            )) : (
              <div className="rounded-3xl border border-dashed border-stone-300 p-8 text-center dark:border-zinc-700">
                <p className="text-sm text-stone-500 dark:text-stone-400">No hiciste solicitudes todavía.</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">Recibidas como proveedor</h2>
          <div className="grid gap-4">
            {asProvider.length > 0 ? asProvider.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{booking.status}</Badge>
                        <Badge variant="outline">{booking.listing.type === "SERVICE" ? "Servicio" : "Producto"}</Badge>
                        <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{booking.listing.title}</span>
                      </div>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Cliente: {booking.client.name} · {new Date(booking.startsAt).toLocaleString("es-AR")} · {booking.timezone}</p>
                      {booking.notes && <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 whitespace-pre-line">{booking.notes}</p>}
                    </div>
                    <Link href={`/servicios/${booking.listing.id}`}>
                      <Button variant="outline" className="rounded-xl">Ver servicio</Button>
                    </Link>
                  </div>
                  <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">Estado: {statusLabel(booking.status)} · Solicitud #{booking.id.slice(0, 8)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/reservas/${booking.id}`}>
                      <Button variant="outline" className="rounded-xl">Ver detalle</Button>
                    </Link>
                  </div>
                  <BookingActions id={booking.id} status={booking.status} isClient={false} isProvider />
                </CardContent>
              </Card>
            )) : (
              <div className="rounded-3xl border border-dashed border-stone-300 p-8 text-center dark:border-zinc-700">
                <p className="text-sm text-stone-500 dark:text-stone-400">No tenés reservas recibidas.</p>
              </div>
            )}
          </div>
        </section>

        {filteredBookings.length === 0 && (
          <div className="rounded-3xl border border-dashed border-stone-300 p-10 text-center dark:border-zinc-700">
            <p className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {selectedStatus === "ALL" ? "No tenés reservas" : "No hay reservas con ese estado"}
            </p>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              {selectedStatus === "ALL" ? "Buscá un servicio con agenda y solicitá un turno." : "Probá otro filtro o volvé a todas las reservas."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
