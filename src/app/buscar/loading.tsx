export default function BuscarLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-stone-200 rounded-lg animate-pulse mb-4" />
        <div className="h-14 w-full bg-stone-100 rounded-xl animate-pulse" />
      </div>
      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 shrink-0 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-stone-100 rounded-lg animate-pulse" />
          ))}
        </aside>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
