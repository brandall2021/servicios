"use client"

interface ChartData {
  month: string
  count: number
}

export function AdminDashboardChart({ data, maxValue }: { data: ChartData[]; maxValue: number }) {
  const barHeight = 180

  return (
    <div className="flex items-end gap-2 h-[200px]">
      {data.map((d) => {
        const h = maxValue > 0 ? (d.count / maxValue) * barHeight : 0
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <span className="text-xs font-medium text-zinc-700">{d.count}</span>
            <div
              className="w-full rounded-t-md bg-orange-500 transition-all duration-500 min-h-[4px]"
              style={{ height: `${Math.max(h, 4)}px` }}
            />
            <span className="text-[10px] text-zinc-400 text-center leading-tight">{d.month}</span>
          </div>
        )
      })}
    </div>
  )
}
