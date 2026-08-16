"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Package, Sparkles } from "lucide-react"
import { MarketplacePrice } from "@/components/shared/marketplace-price"
import type { MarketplaceListingDTO } from "@/lib/marketplace/listings"

const W = 800
const H = 500
const MARGIN = 80

const STREETS_X = [60, 150, 260, 340, 470, 580, 690]
const STREETS_Y = [55, 130, 215, 305, 395]
const DIAG_START: [number, number] = [0, 470]
const DIAG_END: [number, number] = [800, 40]

interface MapPoint {
  listing: MarketplaceListingDTO
  x: number
  y: number
  index: number
}

interface Props {
  listings: MarketplaceListingDTO[]
}

function buildPoints(listings: MarketplaceListingDTO[]): MapPoint[] {
  const withCoords = listings.filter(
    (l) => l.latitude !== null && l.longitude !== null
  )
  if (withCoords.length === 0) return []

  const lats = withCoords.map((l) => l.latitude as number)
  const lngs = withCoords.map((l) => l.longitude as number)
  let minLat = Math.min(...lats)
  let maxLat = Math.max(...lats)
  let minLng = Math.min(...lngs)
  let maxLng = Math.max(...lngs)

  const dLat = maxLat - minLat
  const dLng = maxLng - minLng
  if (dLat === 0 && dLng === 0) {
    minLat -= 0.008
    maxLat += 0.008
    minLng -= 0.008
    maxLng += 0.008
  } else {
    const padLat = dLat * 0.35
    const padLng = dLng * 0.35
    minLat -= padLat
    maxLat += padLat
    minLng -= padLng
    maxLng += padLng
  }

  return withCoords.map((listing, index) => ({
    listing,
    index,
    x:
      MARGIN +
      ((listing.longitude as number) - minLng) /
        (maxLng - minLng) *
        (W - MARGIN * 2),
    y:
      MARGIN +
      (maxLat - (listing.latitude as number)) /
        (maxLat - minLat) *
        (H - MARGIN * 2),
  }))
}

function StreetGrid() {
  return (
    <g>
      {STREETS_X.map((x) => (
        <line key={`vx-${x}`} x1={x} y1="0" x2={x} y2={H} className="map-street" />
      ))}
      {STREETS_Y.map((y) => (
        <line key={`hy-${y}`} x1="0" y1={y} x2={W} y2={y} className="map-street" />
      ))}
      <line x1={DIAG_START[0]} y1={DIAG_START[1]} x2={DIAG_END[0]} y2={DIAG_END[1]} className="map-avenue" />
    </g>
  )
}

function Landmarks() {
  return (
    <g>
      <rect x="470" y="60" width="120" height="80" rx="14" className="map-park" />
      <rect x="140" y="330" width="170" height="70" rx="14" className="map-park" />
      <path
        d="M 660 220 Q 700 280 660 350 T 640 460"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        className="map-water"
      />
    </g>
  )
}

export function SearchMap({ listings }: Props) {
  const points = buildPoints(listings)
  const [active, setActive] = useState<MapPoint | null>(null)

  if (points.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-stone-200/70 bg-stone-50/80 py-20 text-center dark:border-zinc-800 dark:bg-zinc-900/55">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 text-stone-500 dark:text-stone-400 shadow-sm">
          <MapPin className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold text-stone-800 dark:text-stone-200">Sin ubicaciones en esta búsqueda</p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Algunos listados no declaran coordenadas. Probá quitar el filtro de ubicación.</p>
        </div>
      </div>
    )
  }

  const activeX = active ? (active.x / W) * 100 : 0
  const activeY = active ? (active.y / H) * 100 : 0
  const serviceCount = points.filter((p) => p.listing.type === "SERVICE").length
  const productCount = points.length - serviceCount

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-stone-500 dark:text-stone-400">
          <span className="font-semibold text-stone-700 dark:text-stone-200">{points.length}</span> resultados con ubicación en el mapa
        </p>
        <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            {serviceCount} {serviceCount === 1 ? "servicio" : "servicios"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0B2A55] dark:bg-[#163B70]" />
            {productCount} {productCount === 1 ? "producto" : "productos"}
          </span>
        </div>
      </div>

      <div className="relative aspect-[8/5] w-full overflow-visible">
        <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-stone-200/70 shadow-[0_8px_30px_rgba(3,15,37,0.06)] dark:border-zinc-800">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            className="h-full w-full"
            aria-label="Mapa de resultados de búsqueda"
            role="img"
          >
            <rect x="0" y="0" width={W} height={H} className="map-bg" />
            <Landmarks />
            <StreetGrid />
            {points.map((p) => (
              <Link key={p.listing.id} href={p.listing.type === "SERVICE" ? `/servicios/${p.listing.id}` : `/listings/${p.listing.slug}`}>
                <g
                  className="map-pin"
                  onMouseEnter={() => setActive(p)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(p)}
                  onBlur={() => setActive(null)}
                >
                  <ellipse className="map-pin-shadow" cx={p.x} cy={p.y + 15} rx="7" ry="4" />
                  <circle
                    className={p.listing.type === "SERVICE" ? "map-pin-body-service" : "map-pin-body-product"}
                    cx={p.x}
                    cy={p.y}
                    r="11"
                  />
                  <text className="map-pin-number" x={p.x} y={p.y + 3.5}>
                    {p.index + 1}
                  </text>
                </g>
              </Link>
            ))}
          </svg>
        </div>

        {active && (
          <div
            className="pointer-events-none absolute z-20 w-64 -translate-x-1/2 -translate-y-[calc(100%+18px)]"
            style={{ left: `${activeX}%`, top: `${activeY}%` }}
          >
            <div className="rounded-2xl border border-stone-200/80 bg-white/95 p-3.5 shadow-[0_16px_38px_rgba(11,42,85,0.14)] backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-900/95">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                {active.listing.type === "SERVICE" ? (
                  <Sparkles className="h-3 w-3 text-orange-500" />
                ) : (
                  <Package className="h-3 w-3 text-[#163B70] dark:text-[#7da6d8]" />
                )}
                {active.listing.type === "SERVICE" ? "Servicio" : "Producto"}
              </div>
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                {active.listing.title}
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                  {active.listing.locationText || active.listing.city || active.listing.provider.zone || "Sin ubicación"}
                </p>
                <MarketplacePrice
                  priceType={active.listing.priceType}
                  price={active.listing.price}
                  currency={active.listing.currency}
                  priceUnit={active.listing.priceUnit}
                  className="shrink-0 text-sm"
                />
              </div>
            </div>
            <div className="mx-auto h-0 w-0 -mt-px border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/95 dark:border-t-zinc-900/95" />
          </div>
        )}
      </div>
    </div>
  )
}
