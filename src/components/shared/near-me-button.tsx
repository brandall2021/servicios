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
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full ${
        hasCoords
          ? "bg-orange-50 text-orange-700 border border-orange-200"
          : "bg-stone-50 text-stone-600 border border-stone-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
      } disabled:opacity-50`}
    >
      <Navigation className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Buscando..." : hasCoords ? "Cerca de mí activado" : "Servicios cercanos"}
    </button>
  )
}
