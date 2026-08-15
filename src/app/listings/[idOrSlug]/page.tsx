import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ListingStatus, ListingType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PUBLIC_PROVIDER_SELECT } from "@/lib/auth-guard"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StarRating } from "@/components/shared/star-rating"
import { CATEGORIAS } from "@/lib/constants"
import { legacyServiceToListing, listingRowToListing, slugifyListing, type LegacyServiceRow, type MarketplaceListingRow } from "@/lib/marketplace/listings"
import { ArrowLeft, BadgeCheck, Calendar, ChevronRight, Clock3, ExternalLink, MapPin, MessageSquare, Package, Shield, Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import { FavoriteToggleButton } from "@/components/shared/favorite-toggle-button"
import { CompareToggleButton } from "@/components/shared/compare-toggle-button"
import { logCommercialEvent } from "@/lib/commercial-events"
import { CompareTray } from "@/components/shared/compare-tray"
import { ListingMedia } from "@/components/shared/listing-media"
import { MarketplacePrice } from "@/components/shared/marketplace-price"
import { ListingMap } from "@/components/shared/listing-map"

interface Props {
  params: Promise<{ idOrSlug: string }>
}

const providerProfileSelect = {
  kind: true,
  tradeName: true,
  verificationStatus: true,
  responseTimeMinutes: true,
  province: true,
  city: true,
} as const

const providerSelect = {
  ...PUBLIC_PROVIDER_SELECT,
  providerProfile: { select: providerProfileSelect },
} as const

async function getListingDetail(idOrSlug: string, sessionUserId?: string, isAdmin = false) {
  const listing = await prisma.listing.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: {
      category: true,
      provider: { select: providerSelect },
      providerProfile: { select: providerProfileSelect },
      media: { orderBy: { sortOrder: "asc" } },
      service: true,
      product: true,
    },
  })

  if (listing) {
    const canSeeDraft = sessionUserId === listing.providerId || isAdmin
    if (listing.status !== ListingStatus.PUBLISHED && !canSeeDraft) return null
    return listingRowToListing(listing as unknown as MarketplaceListingRow)
  }

  const serviceById = await prisma.servicio.findUnique({
    where: { id: idOrSlug },
    include: {
      usuario: { select: providerSelect },
      fotos: { take: 3 },
      opiniones: { select: { puntuacion: true }, take: 5 },
      _count: { select: { opiniones: true } },
    },
  })

  if (serviceById) {
    if (!serviceById.activo && !(sessionUserId === serviceById.usuario.id || isAdmin)) return null
    return legacyServiceToListing(serviceById as unknown as LegacyServiceRow)
  }

  const legacyServices = await prisma.servicio.findMany({
    where: { activo: true },
    include: {
      usuario: { select: providerSelect },
      fotos: { take: 3 },
      opiniones: { select: { puntuacion: true }, take: 5 },
      _count: { select: { opiniones: true } },
    },
  })

  const legacyBySlug = legacyServices.find((service) => slugifyListing(service.titulo, service.id) === idOrSlug)
  if (legacyBySlug) return legacyServiceToListing(legacyBySlug as unknown as LegacyServiceRow)

  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { idOrSlug } = await params
  const listing = await getListingDetail(idOrSlug)

  if (!listing) return { title: "Listado no encontrado" }

  const suffix = listing.type === ListingType.PRODUCT ? "Productos" : "Servicios"
  return {
    title: `${listing.title} | ${suffix}`,
    description: listing.description.slice(0, 160),
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { idOrSlug } = await params
  const session = await auth()
  const listing = await getListingDetail(idOrSlug, session?.user?.id, session?.user?.role === "ADMIN")

  if (!listing) notFound()

  const favorite = session?.user
    ? await prisma.favorite.findFirst({
        where: { userId: session.user.id, listingId: listing.id },
      })
    : null

  const promotions = await prisma.promotion.findMany({
    where: {
      active: true,
      OR: [{ listingId: listing.id }, { providerId: listing.provider.id }],
      startsAt: { lte: new Date() },
      endsAt: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  if (session?.user) {
    await logCommercialEvent({
      type: "LISTING_VIEWED",
      userId: session.user.id,
      sessionId: session.user.id,
      providerId: listing.provider.id,
      listingId: listing.id,
      metadata: { type: listing.type },
    })
  }

  const catInfo = CATEGORIAS.find((cat) => cat.value === listing.category.id)
  const mainImage = listing.media[0]?.archivo || null
  const whatsappUrl = listing.provider.whatsapp
    ? `https://wa.me/${listing.provider.whatsapp.replace(/[^0-9]/g, "")}`
    : null
  const isService = listing.type === "SERVICE"
  const isProduct = listing.type === "PRODUCT"

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 sm:pb-10">
      <Link
        href={`/buscar?type=${listing.type}`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a resultados
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="overflow-hidden rounded-3xl border border-stone-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
            <ListingMedia
              src={mainImage}
              alt={listing.title}
              type={listing.type}
              categoryLabel={catInfo?.label || listing.category.name}
              featured={listing.featured}
              className="aspect-[16/9]"
            />
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary" className="gap-1.5">
                  <span>{catInfo?.icon}</span>
                  {catInfo?.label || listing.category.name}
                </Badge>
                {listing.provider.verified ? (
                  <Badge variant="success" className="gap-1">
                    <Shield className="h-3 w-3" /> Verificado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3" /> Sin verificar
                  </Badge>
                )}
                {listing.provider.tradeName && (
                  <Badge variant="outline" className="gap-1">
                    <BadgeCheck className="h-3 w-3" /> {listing.provider.tradeName}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-4">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 dark:text-stone-400 mb-5">
                {listing.ratingCount > 0 && (
                  <StarRating value={listing.ratingAverage} size="sm" showValue count={listing.ratingCount} readonly />
                )}
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {listing.locationText || listing.city || listing.provider.zone || "Sin ubicación"}
                </span>
                {listing.publishedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Publicado {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(listing.publishedAt))}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-stone-200/70 dark:border-zinc-700/50">
                <div>
                  <MarketplacePrice priceType={listing.priceType} price={listing.price} currency={listing.currency} priceUnit={listing.priceUnit} className="text-3xl" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {isService && (
                    <>
                      <Link href={`/presupuestos/solicitar?servicioId=${listing.id}`}>
                        <Button className="rounded-xl btn-glow gap-2">
                          Solicitar presupuesto
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/reservas/nueva?listingId=${listing.id}`}>
                        <Button variant="outline" className="rounded-xl gap-2">
                          Reservar turno
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </Link>
                    </>
                  )}
                  {isProduct && (
                    <Link href={`/consultas/productos?listingId=${listing.id}`}>
                      <Button className="rounded-xl btn-glow gap-2">
                        Agregar a consulta
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <FavoriteToggleButton
                    type="LISTING"
                    targetId={listing.id}
                    initialSaved={Boolean(favorite)}
                    returnTo={`/listings/${listing.slug}`}
                  />
                  <CompareToggleButton id={listing.id} type={listing.type} providerId={listing.provider.id} />
                  <Link href={`/chat?proveedor=${listing.provider.id}`}>
                    <Button variant="outline" className="rounded-xl gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Contactar
                    </Button>
                  </Link>
                  <Link href={`/proveedores/${listing.provider.id}`}>
                    <Button variant="ghost" className="rounded-xl gap-2">
                      Ver proveedor
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="prose prose-stone dark:prose-invert max-w-none mt-6">
                <p className="whitespace-pre-line text-stone-600 dark:text-stone-300 leading-relaxed">{listing.description}</p>
              </div>
            </div>
          </section>

          {isService && listing.service && (
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <DetailChip title="Modalidad" value={listing.service.modality || "No especificada"} icon={<Sparkles className="h-4 w-4" />} />
              <DetailChip title="Radio" value={listing.service.coverageRadiusKm ? `${listing.service.coverageRadiusKm} km` : "Sin radio definido"} icon={<MapPin className="h-4 w-4" />} />
              <DetailChip title="Duración" value={listing.service.durationText || "Sin dato"} icon={<Clock3 className="h-4 w-4" />} />
              <DetailChip title="Disponibilidad" value={listing.service.availabilityText || "Sin dato"} icon={<Calendar className="h-4 w-4" />} />
            </section>
          )}

          {isProduct && listing.product && (
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <DetailChip title="SKU" value={listing.product.sku || "Sin SKU"} icon={<Package className="h-4 w-4" />} />
              <DetailChip title="Marca" value={listing.product.brand || "Sin marca"} icon={<BadgeCheck className="h-4 w-4" />} />
              <DetailChip title="Unidad" value={listing.product.unit || "Sin unidad"} icon={<Sparkles className="h-4 w-4" />} />
              <DetailChip title="Entrega" value={listing.product.fulfillment} icon={<ChevronRight className="h-4 w-4" />} />
            </section>
          )}

          {isService && listing.service && (listing.service.includesText || listing.service.excludesText) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {listing.service.includesText && (
                <Card>
                  <CardContent className="p-5">
                    <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">Incluye</h2>
                    <p className="text-sm text-stone-600 dark:text-stone-300 whitespace-pre-line">{listing.service.includesText}</p>
                  </CardContent>
                </Card>
              )}
              {listing.service.excludesText && (
                <Card>
                  <CardContent className="p-5">
                    <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">No incluye</h2>
                    <p className="text-sm text-stone-600 dark:text-stone-300 whitespace-pre-line">{listing.service.excludesText}</p>
                  </CardContent>
                </Card>
              )}
            </section>
          )}

          {isProduct && listing.product?.deliveryText && (
            <Card className="animate-fade-in">
              <CardContent className="p-5">
                <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">Entrega y stock</h2>
                <p className="text-sm text-stone-600 dark:text-stone-300 whitespace-pre-line">{listing.product.deliveryText}</p>
              </CardContent>
            </Card>
          )}

          <ListingMap
            title={listing.title}
            latitude={listing.latitude}
            longitude={listing.longitude}
            locationLabel={listing.locationText || listing.city || listing.provider.zone}
          />

          {promotions.length > 0 && (
            <Card className="animate-fade-in border-orange-200 bg-orange-50/60 dark:border-orange-900/40 dark:bg-orange-900/10">
              <CardContent className="p-5">
                <h2 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">Promociones activas</h2>
                <div className="space-y-3">
                  {promotions.map((promotion) => (
                    <div key={promotion.id} className="rounded-2xl border border-orange-200/70 bg-white p-4 dark:border-orange-900/40 dark:bg-zinc-900">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-stone-100">{promotion.name}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">{promotion.type}</p>
                        </div>
                        <Badge variant="secondary">Activa</Badge>
                      </div>
                      {promotion.code && <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Código: {promotion.code}</p>}
                      {promotion.terms && <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 whitespace-pre-line">{promotion.terms}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <Link href={`/proveedores/${listing.provider.id}`} className="flex items-center gap-3 mb-5 -m-2 p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors">
                <Avatar src={listing.provider.image} fallback={listing.provider.name} size="lg" />
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                    {listing.provider.tradeName || listing.provider.name}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400 truncate">{listing.provider.zone || listing.city || "Proveedor"}</p>
                </div>
              </Link>

              <div className="space-y-3">
                {listing.provider.whatsapp && (
                  <a href={whatsappUrl || "#"} target="_blank" rel="noreferrer">
                    <Button className="w-full gap-2 btn-glow rounded-xl">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                )}
                {listing.provider.website && (
                  <a href={listing.provider.website} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="w-full gap-2 rounded-xl">
                      <ExternalLink className="h-4 w-4" />
                      Sitio web
                    </Button>
                  </a>
                )}
              </div>

              <div className="mt-5 pt-5 border-t border-stone-200/70 dark:border-zinc-700/50 space-y-2 text-sm text-stone-600 dark:text-stone-300">
                <p className="flex items-center justify-between gap-3">
                  <span>Tipo</span>
                  <span className="font-medium">{isService ? "Servicio" : "Producto"}</span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span>Proveedor</span>
                  <span className="font-medium">{listing.provider.kind || "Sin dato"}</span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span>Ubicación</span>
                  <span className="font-medium text-right">{listing.city || listing.provider.zone || "Sin dato"}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    <CompareTray />
    </>
  )
}

function DetailChip({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold mb-1">{title}</p>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
