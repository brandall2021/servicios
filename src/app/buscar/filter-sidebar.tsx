"use client"

import { NearMeButton } from "@/components/shared/near-me-button"
import { CATEGORIAS } from "@/lib/constants"

interface FilterSidebarProps {
  verificado: string
  puntMin: string
  precioMin: string
  precioMax: string
  proveedor: string
}

function navigateWithParam(key: string, value: string) {
  const url = new URL(window.location.href)
  if (value) url.searchParams.set(key, value)
  else url.searchParams.delete(key)
  window.location.href = url.toString()
}

export function FilterSidebar({ verificado, puntMin, precioMin, precioMax, proveedor }: FilterSidebarProps) {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        <div>
          <h3 className="font-semibold text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-3">Categorías</h3>
          <div className="space-y-0.5">
            <a
              href="/buscar"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-zinc-800"
            >
              Todos
            </a>
            {CATEGORIAS.map((cat) => (
              <a
                key={cat.value}
                href={`/buscar?categoria=${cat.value}`}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-zinc-800"
              >
                <span>{cat.icon}</span> {cat.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-3">Cerca de mí</h3>
          <NearMeButton />
        </div>

        <div className="border-t border-stone-200/70 dark:border-zinc-700/50 pt-4 space-y-4">
          <h3 className="font-semibold text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400">Filtros</h3>

          <label className="flex items-center gap-2.5 text-sm text-stone-600 dark:text-stone-400 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={verificado === "true"}
              onChange={(e) => navigateWithParam("verificado", e.target.checked ? "true" : "")}
              suppressHydrationWarning
              className="rounded border-stone-300 dark:border-zinc-600 text-orange-600 focus:ring-orange-500/30"
            />
            Solo verificados
          </label>

          <div>
            <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1.5">Puntaje mínimo</label>
            <select
              defaultValue={puntMin || ""}
              onChange={(e) => navigateWithParam("punt_min", e.target.value)}
              aria-label="Puntaje mínimo"
              className="w-full h-9 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl text-xs bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            >
              <option value="">Cualquier puntaje</option>
              <option value="4">4 ★ o más</option>
              <option value="3">3 ★ o más</option>
              <option value="2">2 ★ o más</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1.5">Precio mínimo</label>
            <input
              type="number"
              autoComplete="off"
              suppressHydrationWarning
              defaultValue={precioMin || ""}
              placeholder="$0"
              onBlur={(e) => navigateWithParam("precio_min", e.target.value)}
              className="w-full h-9 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl text-xs bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1.5">Precio máximo</label>
            <input
              type="number"
              autoComplete="off"
              suppressHydrationWarning
              defaultValue={precioMax || ""}
              placeholder="$999999"
              onBlur={(e) => navigateWithParam("precio_max", e.target.value)}
              className="w-full h-9 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl text-xs bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1.5">Nombre del proveedor</label>
            <input
              type="text"
              autoComplete="off"
              suppressHydrationWarning
              defaultValue={proveedor || ""}
              placeholder="Buscar por nombre..."
              onBlur={(e) => navigateWithParam("proveedor", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigateWithParam("proveedor", (e.target as HTMLInputElement).value)
                }
              }}
              className="w-full h-9 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl text-xs bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}

interface RadioSelectProps {
  radio: string
}

export function RadioSelect({ radio }: RadioSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-stone-500 dark:text-stone-400">Radio:</label>
      <select
        aria-label="Radio de búsqueda"
        className="h-9 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl text-xs bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
        onChange={(e) => navigateWithParam("radio", e.target.value)}
        defaultValue={radio || "50"}
      >
        <option value="10">10 km</option>
        <option value="25">25 km</option>
        <option value="50">50 km</option>
        <option value="100">100 km</option>
        <option value="200">200 km</option>
      </select>
    </div>
  )
}
