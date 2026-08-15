import { Card, CardContent } from "@/components/ui/card"

interface ListingMapProps {
  title: string
  latitude: number | null
  longitude: number | null
  locationLabel?: string | null
}

export function ListingMap({ title, latitude, longitude, locationLabel }: ListingMapProps) {
  if (latitude === null || longitude === null) return null

  const delta = 0.012
  const bbox = `${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}`
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`
  const openHref = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">Mapa de ubicación</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">{locationLabel || title}</p>
          </div>
          <a
            href={openHref}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Abrir mapa
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200/70 dark:border-zinc-700/50 bg-stone-100 dark:bg-zinc-800">
          <iframe
            title={`Mapa de ${title}`}
            src={src}
            loading="lazy"
            className="h-64 w-full border-0"
          />
        </div>
      </CardContent>
    </Card>
  )
}
