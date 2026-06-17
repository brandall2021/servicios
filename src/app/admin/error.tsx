"use client"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
      <h2 className="text-lg font-semibold text-stone-900 mb-2">Error en el panel de administración</h2>
      <p className="text-sm text-stone-500 mb-6">No pudimos cargar los datos. Intentalo de nuevo.</p>
      <button
        onClick={reset}
        className="h-10 px-6 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}
