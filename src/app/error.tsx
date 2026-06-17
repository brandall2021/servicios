"use client"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-xl">!</span>
        </div>
        <h2 className="text-lg font-semibold text-stone-900 mb-2">Algo salió mal</h2>
        <p className="text-sm text-stone-500 mb-6">
          Ocurrió un error inesperado. Por favor intentá de nuevo.
        </p>
        <button
          onClick={reset}
          className="h-10 px-6 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
