"use client"

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react"
import { ZoomIn } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { CATEGORIAS } from "@/lib/constants"
import type { LucideIcon } from "lucide-react"
import {
  BrickWall,
  Lightbulb,
  ShowerHead,
  Palette,
  Wrench,
  Square,
  Home,
  GripVertical,
  Zap,
  Sprout,
  Nut,
  Package,
} from "lucide-react"

type Foto = { id: string; archivo: string }

interface ServiceGalleryProps {
  fotos: Foto[]
  titulo: string
  categoria: string
}

const iconMap: Record<string, LucideIcon> = {
  materiales: BrickWall,
  iluminacion: Lightbulb,
  sanitarios: ShowerHead,
  pintura: Palette,
  herramientas: Wrench,
  pisos: Square,
  techos: Home,
  hierro: GripVertical,
  electricidad: Zap,
  jardineria: Sprout,
  ferreteria: Nut,
  otros: Package,
}

export function ServiceGallery({ fotos, titulo, categoria }: ServiceGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)

  const catInfo = CATEGORIAS.find((c) => c.value === categoria)
  const CatIcon = useMemo(() => iconMap[categoria] || Package, [categoria])
  const current = fotos[selected]

  if (fotos.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-stone-100 via-orange-50 to-stone-200 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-900 border border-stone-200/70 dark:border-zinc-700/50">
        <div className="aspect-[4/3] relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top,_rgba(255,138,0,0.16),_transparent_55%)]" />
          <div className="relative flex flex-col items-center gap-3 text-center px-6">
            <div className="h-16 w-16 rounded-2xl bg-white/90 dark:bg-zinc-900/80 border border-white/70 dark:border-zinc-700/60 shadow-sm flex items-center justify-center">
              <CatIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-stone-700 dark:text-stone-200">{catInfo?.label || categoria}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">Sin imágenes de portada</p>
            </div>
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/90 dark:bg-zinc-900/80 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 border border-white/70 dark:border-zinc-700/60 shadow-sm"
            >
              <ZoomIn className="h-4 w-4" />
              Ver detalle
            </button>
          </div>
        </div>

        <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={titulo}>
          <div className="aspect-[4/3] flex items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 via-orange-50 to-stone-200 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-900">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <CatIcon className="h-12 w-12 text-orange-600" />
              <p className="text-sm text-stone-500 dark:text-stone-400">No hay imagen cargada para ampliar</p>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-stone-200/70 dark:border-zinc-700/50 bg-stone-100 dark:bg-zinc-800">
        <button type="button" className="block w-full text-left" onClick={() => setZoomOpen(true)}>
          <img
            src={current?.archivo || fotos[0].archivo}
            alt={titulo}
            className="w-full aspect-[4/3] object-cover"
          />
        </button>
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 shadow-sm border border-white/70 dark:border-zinc-700/60"
        >
          <ZoomIn className="h-3.5 w-3.5" />
          Ampliar
        </button>
      </div>

      {fotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {fotos.map((foto, index) => (
            <button
              key={foto.id}
              type="button"
              onClick={() => setSelected(index)}
              className={`shrink-0 rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                selected === index
                  ? "border-orange-500 shadow-[0_0_0_3px_rgba(255,138,0,0.15)]"
                  : "border-transparent hover:border-orange-200"
              }`}
            >
              <img src={foto.archivo} alt="" className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
      )}

      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={titulo}>
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl bg-stone-100 dark:bg-zinc-800">
            <img src={current?.archivo || fotos[0].archivo} alt={titulo} className="w-full max-h-[70vh] object-contain bg-black/5" />
          </div>
          {fotos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {fotos.map((foto, index) => (
                <button
                  key={foto.id}
                  type="button"
                  onClick={() => setSelected(index)}
                  className={`shrink-0 rounded-lg border overflow-hidden transition-colors ${
                    selected === index
                      ? "border-orange-500"
                      : "border-stone-200 dark:border-zinc-700"
                  }`}
                >
                  <img src={foto.archivo} alt="" className="h-14 w-14 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
