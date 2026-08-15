"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Search, ShieldCheck, Store } from "lucide-react"
import { MarketplacePrice } from "@/components/shared/marketplace-price"
import { ListingMedia } from "@/components/shared/listing-media"
import { CATEGORIAS } from "@/lib/constants"
import type { MarketplaceListingDTO } from "@/lib/marketplace/listings"

interface HeroSearchProps {
  featuredListings: MarketplaceListingDTO[]
}

function listingHref(listing: MarketplaceListingDTO) {
  return listing.type === "SERVICE" ? `/servicios/${listing.id}` : `/listings/${listing.slug}`
}

function ListingPreview({ listing }: { listing: MarketplaceListingDTO }) {
  return (
    <Link href={listingHref(listing)} className="group block">
      <article className="overflow-hidden rounded-[28px] border border-stone-200/70 bg-white shadow-[0_20px_70px_rgba(3,15,37,0.18)] transition-transform duration-300 group-hover:-translate-y-1">
        <ListingMedia
          src={listing.media[0]?.archivo}
          alt={listing.title}
          type={listing.type}
          categoryLabel={listing.category.name}
          featured={listing.featured}
          className="aspect-[4/3]"
        />
        <div className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            <span className="rounded-full bg-orange-50 px-2 py-1 text-orange-700">
              {listing.type === "SERVICE" ? "Servicio" : "Producto"}
            </span>
            {listing.provider.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                <ShieldCheck className="h-3 w-3" /> Verificado
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-stone-900 line-clamp-2">
              {listing.title}
            </h3>
            <p className="mt-1 text-sm text-stone-500 line-clamp-1">
              {listing.provider.tradeName || listing.provider.name}
            </p>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <MarketplacePrice priceType={listing.priceType} price={listing.price} currency={listing.currency} priceUnit={listing.priceUnit} className="text-lg" />
              <p className="mt-1 text-xs text-stone-500 line-clamp-1">
                {listing.locationText || listing.city || listing.provider.zone || "Sin ubicación"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-700 transition-transform duration-300 group-hover:translate-x-0.5">
              Ver detalle
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export function HeroSearch({ featuredListings }: HeroSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [type, setType] = useState("ALL")
  const primary = featuredListings[0]
  const secondary = featuredListings.slice(1, 3)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    const params = new URLSearchParams()
    if (type !== "ALL") params.set("type", type)
    if (q) {
      params.set("q", q)
      router.push(`/buscar?${params.toString()}`)
    } else {
      router.push(params.toString() ? `/buscar?${params.toString()}` : "/buscar")
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#081F3D] py-8 sm:py-10 lg:py-14 noise-overlay">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,138,0,0.12),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(22,59,112,0.7),transparent_32%),linear-gradient(135deg,#081F3D_0%,#0B2A55_42%,#06162E_100%)]" />
      <div className="absolute top-8 left-[6%] hidden h-[460px] w-[460px] rounded-full bg-orange-400/15 blur-[120px] sm:block" />
      <div className="absolute bottom-[-120px] right-[2%] hidden h-[580px] w-[580px] rounded-full bg-[#163B70]/30 blur-[140px] lg:block" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.24em] text-orange-200 uppercase backdrop-blur-sm">
                Marketplace argentino
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-7xl text-balance animate-fade-up animate-fade-up-delay-1">
              Encontrá lo que necesitás,
              <span className="block text-orange-300">cerca tuyo.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg animate-fade-up animate-fade-up-delay-2">
              Compará servicios, productos, reputación y disponibilidad. Consultá directo a profesionales y comercios de confianza.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-3 sm:grid-cols-[170px_minmax(0,1fr)_auto] animate-fade-up animate-fade-up-delay-3">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                aria-label="Tipo de búsqueda"
                className="h-13 w-full rounded-2xl border border-white/10 bg-white/95 px-4 text-base text-stone-900 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="ALL">Todo</option>
                <option value="SERVICE">Servicios</option>
                <option value="PRODUCT">Productos</option>
              </select>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  autoComplete="off"
                  suppressHydrationWarning
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="¿Qué necesitás hoy?"
                  className="h-13 w-full rounded-2xl border border-white/10 bg-white/95 pl-12 pr-4 text-base text-stone-900 placeholder:text-zinc-400 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <button
                type="submit"
                className="btn-glow h-13 inline-flex items-center justify-center gap-2 rounded-2xl px-7 text-base font-semibold shadow-[0_10px_24px_rgba(255,138,0,0.35)] active:scale-[0.98]"
              >
                Buscar
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/75 animate-fade-up animate-fade-up-delay-4">
              <Link href="/register?role=PROVIDER" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 transition-all duration-300 hover:bg-white/12 hover:text-white">
                <Store className="h-4 w-4 text-orange-300" />
                Quiero ofrecer
              </Link>
              <Link href="#categorias" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 transition-all duration-300 hover:bg-white/12 hover:text-white">
                Explorar categorías
              </Link>
              <Link href="/buscar" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 transition-all duration-300 hover:bg-white/12 hover:text-white">
                Ver todo el marketplace
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/82 animate-fade-up animate-fade-up-delay-4">
              {[
                "Profesionales locales",
                "Comparación clara",
                "Contacto directo",
              ].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/8 px-4 py-2 backdrop-blur-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-6 rounded-[36px] bg-orange-500/20 blur-[120px]" />
            <div className="relative space-y-4">
              {primary ? (
                <ListingPreview listing={primary} />
              ) : (
                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/92 p-6 text-stone-900 shadow-[0_20px_70px_rgba(3,15,37,0.18)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">Marketplace vivo</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">Servicios y productos en un solo lugar</h2>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    Explorá publicaciones reales, compará opciones y contactá directo sin dar vueltas.
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {secondary.map((listing) => (
                  <Link key={listing.id} href={listingHref(listing)} className="group block">
                    <article className="overflow-hidden rounded-[24px] border border-stone-200/70 bg-white/95 shadow-[0_12px_36px_rgba(3,15,37,0.12)] transition-transform duration-300 group-hover:-translate-y-1">
                      <ListingMedia
                        src={listing.media[0]?.archivo}
                        alt={listing.title}
                        type={listing.type}
                        categoryLabel={listing.category.name}
                        className="aspect-[5/4]"
                      />
                      <div className="p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                          {listing.type === "SERVICE" ? "Servicio" : "Producto"}
                        </p>
                        <h3 className="mt-2 line-clamp-2 text-sm font-semibold tracking-tight text-stone-900">
                          {listing.title}
                        </h3>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <MarketplacePrice priceType={listing.priceType} price={listing.price} currency={listing.currency} priceUnit={listing.priceUnit} className="text-base" />
                          <span className="text-xs font-medium text-orange-700">Ver</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}

                {secondary.length < 2 && (
                  <div className="rounded-[24px] border border-dashed border-white/20 bg-white/8 p-5 text-white/80 backdrop-blur-sm sm:col-span-1">
                    <div className="flex h-full min-h-[180px] flex-col justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">Confianza</p>
                        <p className="mt-2 text-lg font-semibold text-white">Perfiles con reputación visible</p>
                      </div>
                      <p className="text-sm leading-relaxed text-white/72">
                        Revisá disponibilidad, ubicación y datos de contacto antes de decidir.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 text-white backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">Servicios</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/78">
                    Publicaciones con fotos, precio, ubicación y respuesta directa.
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 text-white backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">Productos</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/78">
                    Catálogo con stock, entrega y cotizaciones visibles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-nowrap gap-3 overflow-x-auto pb-1">
          {CATEGORIAS.slice(0, 8).map((cat) => (
            <Link
              key={cat.value}
              href={`/buscar?categoria=${cat.value}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white/16 hover:text-white"
            >
              <span className="text-orange-300">{cat.icon}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
