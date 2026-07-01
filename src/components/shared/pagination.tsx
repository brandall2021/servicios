"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface Props {
  page: number
  pages: number
  total: number
  label?: string
}

export function Pagination({ page, pages, total, label = "resultados" }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (pages <= 1) return null

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <p className="text-sm text-gray-500">
        {total} {label} — página {page} de {pages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>

        {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
          let p: number
          if (pages <= 7) {
            p = i + 1
          } else if (page <= 4) {
            p = i + 1
          } else if (page >= pages - 3) {
            p = pages - 6 + i
          } else {
            p = page - 3 + i
          }
          return (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                p === page
                  ? "bg-orange-600 text-white border-orange-600"
                  : "hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        })}

        <button
          onClick={() => goTo(page + 1)}
          disabled={page >= pages}
          className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}