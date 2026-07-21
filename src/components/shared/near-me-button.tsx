"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navigation } from "lucide-react"

export function NearMeButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  function handleClick() {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("lat", pos.coords.latitude.toString())
        params.set("lng", pos.coords.longitude.toString())
        params.set("radio", "50")
        router.push(`/buscar?${params.toString()}`)
      },
      () => { setLoading(false) },
      { enableHighAccuracy: true }
    )
  }

  const hasCoords = searchParams.has("lat") && searchParams.has("lng")

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 w-full ${
        hasCoords
          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200/70 dark:border-orange-800/50"
          : "bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 border border-stone-200/70 dark:border-zinc-700/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-400 hover:border-orange-200/70 dark:hover:border-orange-800/50"
      } disabled:opacity-50 active:scale-[0.97]`}
    >
      <Navigation className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Buscando..." : hasCoords ? "Cerca de mí activado" : "Servicios cercanos"}
    </button>
  )
}
