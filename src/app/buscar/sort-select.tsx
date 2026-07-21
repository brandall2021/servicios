"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("sort", value)
    } else {
      params.delete("sort")
    }
    router.push(`/buscar?${params.toString()}`)
  }

  return (
    <select
      className="h-9 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl text-xs bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
      value={searchParams.get("sort") || ""}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="">Más relevantes</option>
      <option value="precio_asc">Menor precio</option>
      <option value="precio_desc">Mayor precio</option>
      <option value="rating">Mejor calificados</option>
    </select>
  )
}
