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
        className={`shrink-0 px-4 py-2 text-sm rounded-xl border transition-all duration-300 ${
          !selected
            ? "bg-orange-600 text-white border-orange-600 font-medium shadow-sm shadow-orange-600/20"
            : "bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 border-stone-200/70 dark:border-zinc-700/50 hover:border-orange-300 dark:hover:border-orange-600/50"
        }`}
      >
        Todas
      </button>
      {categorias.map((cat) => (
        <button
          key={cat.value}
          onClick={() => selectCategory(cat.value)}
          className={`shrink-0 px-4 py-2 text-sm rounded-xl border transition-all duration-300 whitespace-nowrap ${
            selected === cat.value
              ? "bg-orange-600 text-white border-orange-600 font-medium shadow-sm shadow-orange-600/20"
              : "bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 border-stone-200/70 dark:border-zinc-700/50 hover:border-orange-300 dark:hover:border-orange-600/50"
          }`}
        >
          {cat.icon} {cat.label}
        </button>
      ))}
    </div>
  )
}
