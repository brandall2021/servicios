"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-2xl bg-white dark:bg-zinc-800 text-stone-700 dark:text-stone-300 shadow-[0_4px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex items-center justify-center hover:bg-stone-50 dark:hover:bg-zinc-700 hover:shadow-[0_8px_32px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 animate-fade-in border border-stone-200/70 dark:border-zinc-700/50"
      aria-label="Volver arriba"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  )
}