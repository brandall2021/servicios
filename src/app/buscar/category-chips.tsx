"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface CategoryChipsProps {
  categorias: readonly { value: string; label: string; icon: string }[]
  selected: string
}

export function CategoryChips({ categorias, selected }: CategoryChipsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function selectCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("categoria", value)
    } else {
      params.delete("categoria")
    }
    params.delete("sort")
    router.push(`/buscar?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mb-1 scrollbar-none">
      <button
        onClick={() => selectCategory("")}
        className={`shrink-0 px-3 py-1.5 text-sm rounded-full border transition-colors ${
          !selected
            ? "bg-orange-600 text-white border-orange-600 font-medium"
            : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-orange-300"
        }`}
      >
        Todas
      </button>
      {categorias.map((cat) => (
        <button
          key={cat.value}
          onClick={() => selectCategory(cat.value)}
          className={`shrink-0 px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap ${
            selected === cat.value
              ? "bg-orange-600 text-white border-orange-600 font-medium"
              : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-orange-300"
          }`}
        >
          {cat.icon} {cat.label}
        </button>
      ))}
    </div>
  )
}
