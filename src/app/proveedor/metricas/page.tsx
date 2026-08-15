import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getMarketplaceListingDetail } from "@/lib/marketplace/detail"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function ProveedorMetricasPage() {
  const session = await auth()
  if (!session?.user) redirect(`/login?returnTo=${encodeURIComponent("/proveedor/metricas")}`)
  if (session.user.role !== "PROVIDER" && session.user.role !== "ADMIN") redirect("/")

  const events = await prisma.commercialEvent.groupBy({
    by: ["type"],
    where: { providerId: session.user.id },
    _count: { _all: true },
  })

  const views = events.find((event) => event.type === "LISTING_VIEWED")?._count._all || 0
  const favorites = events.find((event) => event.type === "FAVORITE_ADDED")?._count._all || 0
  const compareAdds = events.find((event) => event.type === "COMPARE_ADDED")?._count._all || 0
  const contactReveals = events.find((event) => event.type === "CONTACT_REVEALED")?._count._all || 0

  const topListings = await prisma.commercialEvent.groupBy({
    by: ["listingId"],
    where: { providerId: session.user.id, type: "LISTING_VIEWED", listingId: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { listingId: "desc" } },
    take: 5,
  })

  const topItems = await Promise.all(
    topListings.map(async (entry) => {
      const listing = entry.listingId ? await getMarketplaceListingDetail(entry.listingId, session.user.id, session.user.role === "ADMIN", { includeInactive: true }) : null
      return { listing, count: entry._count._all }
    })
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Panel comercial</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Métricas</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Visión inicial de rendimiento por publicaciones y acciones comerciales.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Vistas" value={views} />
        <MetricCard label="Favoritos" value={favorites} />
        <MetricCard label="Comparaciones" value={compareAdds} />
        <MetricCard label="Contactos revelados" value={contactReveals} />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Top publicaciones vistas</h2>
            <Badge variant="secondary">{topItems.length}</Badge>
          </div>
          <div className="space-y-3">
            {topItems.length > 0 ? topItems.map((item, index) => (
              item.listing ? (
                <Link key={item.listing.id} href={`/listings/${item.listing.slug}`} className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 px-4 py-3 hover:bg-stone-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900 dark:text-stone-100 truncate">{index + 1}. {item.listing.title}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400 truncate">{item.listing.type === "SERVICE" ? "Servicio" : "Producto"}</p>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">{item.count}</span>
                </Link>
              ) : null
            )) : (
              <p className="text-sm text-stone-500 dark:text-stone-400">Todavía no hay datos para mostrar.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">{label}</p>
        <p className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100">{value}</p>
      </CardContent>
    </Card>
  )
}
