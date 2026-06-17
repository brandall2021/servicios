export default function PresupuestosLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="h-8 w-48 bg-stone-200 rounded-lg animate-pulse mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-stone-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
