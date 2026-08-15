import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getMarketplaceListingDetail } from "@/lib/marketplace/detail"
import { BookingComposeForm } from "@/components/shared/booking-compose-form"
import { MarketplaceCard } from "@/components/shared/marketplace-card"
import { Button } from "@/components/ui/button"

interface Props {
  searchParams: Promise<{ listingId?: string }>
}

export default async function NuevaReservaPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect(`/login?returnTo=${encodeURIComponent("/reservas/nueva")}`)

  const params = await searchParams
  const listing = params.listingId ? await getMarketplaceListingDetail(params.listingId, session.user.id, session.user.role === "ADMIN", { includeInactive: true }) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Nueva reserva</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Solicitar turno</h1>
      </div>

      {listing && listing.type === "SERVICE" ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <MarketplaceCard listing={listing} />
          <BookingComposeForm listingId={listing.id} />
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-stone-300 p-10 text-center dark:border-zinc-700">
          <p className="text-lg font-semibold text-stone-900 dark:text-stone-100">Elegí un servicio</p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Necesitás abrir una publicación de servicio para solicitar una reserva.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/buscar?type=SERVICE"><Button className="rounded-xl">Buscar servicios</Button></Link>
            <Link href="/reservas"><Button variant="outline" className="rounded-xl">Ver reservas</Button></Link>
          </div>
        </div>
      )}
    </div>
  )
}
