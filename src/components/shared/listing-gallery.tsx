"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Badge } from "@/components/ui/badge"
import { ListingMedia } from "@/components/shared/listing-media"
import { cn } from "@/lib/utils"
import { ListingType } from "@prisma/client"

interface ListingGalleryProps {
  media: Array<{ id: string; archivo: string }>
  title: string
  type: ListingType
  categoryLabel?: string | null
  featured?: boolean
}

export function ListingGallery({ media, title, type, categoryLabel, featured }: ListingGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const images = media.filter((m) => m.archivo)
  const current = images[selected]

  if (images.length === 0) {
    return (
      <ListingMedia
        src={null}
        alt={title}
        type={type}
        categoryLabel={categoryLabel}
        featured={featured}
        className="aspect-[16/9]"
      />
    )
  }

  function step(delta: number) {
    setSelected((prev) => (prev + delta + images.length) % images.length)
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl border border-stone-200/70 dark:border-zinc-700/50 bg-stone-100 dark:bg-zinc-800">
        <button type="button" className="block w-full text-left" onClick={() => setZoomOpen(true)} aria-label="Ampliar imagen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.archivo} alt={title} className="w-full aspect-[16/9] object-cover" />
        </button>

        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <Badge variant="secondary" className="backdrop-blur-sm bg-white/85 text-stone-700 border-white/60">
            {type === ListingType.PRODUCT ? "Producto" : "Servicio"}
          </Badge>
          {featured && <Badge className="backdrop-blur-sm bg-orange-600/90 text-white border-orange-500/50">Destacado</Badge>}
        </div>

        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 shadow-sm border border-white/70 dark:border-zinc-700/60"
        >
          <ZoomIn className="h-3.5 w-3.5" />
          Ampliar
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                step(-1)
              }}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-zinc-900/80 text-stone-700 dark:text-stone-200 shadow-sm border border-white/70 dark:border-zinc-700/60"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                step(1)
              }}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-zinc-900/80 text-stone-700 dark:text-stone-200 shadow-sm border border-white/70 dark:border-zinc-700/60"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
              {selected + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Ver imagen ${index + 1}`}
              aria-current={selected === index}
              className={cn(
                "shrink-0 rounded-xl border-2 overflow-hidden transition-all duration-200",
                selected === index
                  ? "border-orange-500 shadow-[0_0_0_3px_rgba(255,138,0,0.15)]"
                  : "border-transparent hover:border-orange-200"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.archivo} alt="" className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
      )}

      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={title}>
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl bg-stone-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.archivo} alt={title} className="w-full max-h-[70vh] object-contain bg-black/5" />
          </div>
          {images.length > 1 && (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelected(index)}
                    className={cn(
                      "shrink-0 rounded-lg border overflow-hidden transition-colors",
                      selected === index ? "border-orange-500" : "border-stone-200 dark:border-zinc-700"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.archivo} alt="" className="h-14 w-14 object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-stone-300"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-stone-500">
                  {selected + 1} / {images.length}
                </span>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-stone-300"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
