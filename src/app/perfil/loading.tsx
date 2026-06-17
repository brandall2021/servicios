export default function PerfilLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 rounded-full bg-stone-200 animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-stone-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
