export default function ChatLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="h-[600px] flex rounded-xl border border-stone-200 overflow-hidden">
        <div className="w-80 border-r border-stone-200 p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-stone-200 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-28 bg-stone-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-stone-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
        </div>
      </div>
    </div>
  )
}
