import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getMarketplaceListingsByIds } from "@/lib/marketplace/detail"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, CircleAlert } from "lucide-react"

interface Props {
  searchParams: Promise<{ ids?: string }>
}

function valueClass(value: string, highlight?: string) {
  return highlight && value === highlight ? "text-orange-700 dark:text-orange-300 font-semibold" : "text-stone-700 dark:text-stone-300"
}

export default async function CompararPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) {
    redirect(`/login?returnTo=${encodeURIComponent("/comparar")}`)
  }

  const params = await searchParams
  const ids = (params.ids || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4)

  if (ids.length < 2) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-3xl border border-dashed border-stone-300 p-10 text-center dark:border-zinc-700">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Comparador</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Elegí entre 2 y 4 publicaciones para comparar.</p>
          <div className="mt-5">
            <Link href="/buscar">
              <Button className="rounded-xl">Ir a buscar</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const listings = await getMarketplaceListingsByIds(ids, session.user.id, session.user.role === "ADMIN", { includeInactive: true })

  if (listings.length < 2) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Comparador</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">No encontramos suficientes publicaciones válidas para comparar.</p>
        </div>
      </div>
    )
  }

  const mixed = new Set(listings.map((listing) => listing.type)).size > 1
  const category = listings[0]?.category.id
  const sameCategory = listings.every((listing) => listing.category.id === category)
  const isService = listings[0].type === "SERVICE"

  if (mixed) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/15 dark:text-amber-100">
          <h1 className="text-2xl font-bold mb-2">No se pueden mezclar tipos</h1>
          <p className="text-sm">Compará solo servicios o solo productos. Volvé y elegí publicaciones del mismo tipo.</p>
          <div className="mt-5">
            <Link href="/buscar">
              <Button variant="outline" className="rounded-xl border-amber-300 bg-white/70 text-amber-900 hover:bg-white dark:border-amber-700 dark:bg-amber-900/10 dark:text-amber-100">
                Volver a buscar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const title = isService ? "Comparar servicios" : "Comparar productos"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/buscar" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">{title}</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {sameCategory ? "Misma categoría" : "Categorías distintas: compará con cuidado los atributos equivalentes."}
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <table className="min-w-full text-left">
          <thead className="bg-stone-50 dark:bg-zinc-800/70">
            <tr>
              <th className="sticky left-0 z-10 bg-inherit px-5 py-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Atributo</th>
              {listings.map((listing) => (
                <th key={listing.id} className="px-5 py-4 align-top min-w-[260px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{listing.type === "SERVICE" ? "Servicio" : "Producto"}</Badge>
                      {listing.status !== "PUBLISHED" && <Badge variant="outline">No disponible</Badge>}
                    </div>
                    <div className="font-semibold text-stone-900 dark:text-stone-100">{listing.title}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">{listing.provider.tradeName || listing.provider.name}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Precio" values={listings.map((listing) => listing.price !== null ? `$${listing.price.toLocaleString("es-AR")}` : listing.priceUnit || "Consultá")} />
            {isService ? (
              <>
                <Row label="Modalidad" values={listings.map((listing) => listing.service?.modality || "Sin dato")} />
                <Row label="Cobertura" values={listings.map((listing) => listing.service?.coverageRadiusKm ? `${listing.service.coverageRadiusKm} km` : "Sin dato")} />
                <Row label="Disponibilidad" values={listings.map((listing) => listing.service?.availabilityText || "Sin dato")} />
                <Row label="Duración" values={listings.map((listing) => listing.service?.durationText || "Sin dato")} />
                <Row label="Proveedor verificado" values={listings.map((listing) => listing.provider.verified ? "Sí" : "No")} highlight="Sí" />
                <Row label="Tiempo de respuesta" values={listings.map((listing) => listing.provider.responseTimeMinutes ? `${listing.provider.responseTimeMinutes} min` : "Sin dato")} />
              </>
            ) : (
              <>
                <Row label="Marca" values={listings.map((listing) => listing.product?.brand || "Sin dato")} />
                <Row label="Stock" values={listings.map((listing) => listing.product?.stockQuantity !== null && listing.product?.stockQuantity !== undefined ? String(listing.product.stockQuantity) : "Sin dato")} />
                <Row label="Pedido mínimo" values={listings.map((listing) => listing.product?.minimumOrder !== null && listing.product?.minimumOrder !== undefined ? String(listing.product.minimumOrder) : "Sin dato")} />
                <Row label="Entrega" values={listings.map((listing) => listing.product?.fulfillment || "Sin dato")} />
                <Row label="Proveedor verificado" values={listings.map((listing) => listing.provider.verified ? "Sí" : "No")} highlight="Sí" />
                <Row label="Rating" values={listings.map((listing) => listing.ratingCount > 0 ? `${listing.ratingAverage.toFixed(1)}/5` : "Sin opiniones")} />
              </>
            )}
            <Row label="Ubicación" values={listings.map((listing) => listing.locationText || listing.city || listing.provider.zone || "Sin dato")} />
            <Row label="Estado" values={listings.map((listing) => listing.status === "PUBLISHED" ? "Disponible" : "No disponible")} />
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={listing.status === "PUBLISHED" ? "secondary" : "outline"}>
                {listing.status === "PUBLISHED" ? "Disponible" : "No disponible"}
              </Badge>
              {!sameCategory && <Badge variant="outline">Categoría distinta</Badge>}
            </div>
            <p className="font-semibold text-stone-900 dark:text-stone-100">{listing.title}</p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{listing.provider.tradeName || listing.provider.name}</p>
            <div className="mt-3 flex gap-2">
              <Link href={`/listings/${listing.slug}`} className="inline-flex flex-1 items-center justify-center rounded-xl btn-glow px-3 py-2 text-sm font-medium">
                Ver
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Row({ label, values, highlight }: { label: string; values: string[]; highlight?: string }) {
  const best = values[0]
  return (
    <tr className="border-t border-stone-200/70 dark:border-zinc-700/50">
      <th className="sticky left-0 z-10 bg-white px-5 py-4 text-sm font-medium text-stone-600 dark:bg-zinc-900 dark:text-stone-300">{label}</th>
      {values.map((value, index) => (
        <td key={`${label}-${index}`} className={`px-5 py-4 text-sm ${valueClass(value, highlight)}`}>
          <span className="inline-flex items-center gap-2">
            {highlight && value === highlight && <Check className="h-4 w-4 text-orange-600" />}
            {value}
          </span>
        </td>
      ))}
    </tr>
  )
}
