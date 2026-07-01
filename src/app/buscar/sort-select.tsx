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
      className="h-8 px-2 border border-stone-200 dark:border-zinc-700 rounded-lg text-xs bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 outline-none focus:border-orange-500"
      value={searchParams.get("sort") || ""}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="">Más relevantes</option>
      <option value="precio_asc">Menor precio</option>
      <option value="precio_desc">Mayor precio</option>
    </select>
  )
}
