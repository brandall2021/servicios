import { Search, MessageSquareText, Star, ShieldCheck } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Buscá",
    description: "Encontrá los materiales o servicios que necesitás filtrando por categoría, ubicación y precio.",
    color: "blue",
  },
  {
    icon: MessageSquareText,
    title: "Compará",
    description: "Compará precios y opiniones de diferentes proveedores en un solo lugar.",
    color: "cyan",
  },
  {
    icon: Star,
    title: "Elegí",
    description: "Seleccioná la mejor opción según reputación, precio y cercanía.",
    color: "orange",
  },
  {
    icon: ShieldCheck,
    title: "Contratá",
    description: "Trabajá con proveedores verificados. Tu satisfacción es lo más importante.",
    color: "purple",
  },
]

const stepColors: Record<string, { bg: string; icon: string; ring: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-900/20", icon: "text-blue-600 dark:text-blue-400", ring: "ring-blue-100 dark:ring-blue-800/30" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-900/20", icon: "text-cyan-600 dark:text-cyan-400", ring: "ring-cyan-100 dark:ring-cyan-800/30" },
  orange: { bg: "bg-orange-50 dark:bg-orange-900/20", icon: "text-orange-600 dark:text-orange-400", ring: "ring-orange-100 dark:ring-orange-800/30" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", icon: "text-purple-600 dark:text-purple-400", ring: "ring-purple-100 dark:ring-purple-800/30" },
}

export function TrustMetrics() {
  return (
    <section className="relative overflow-hidden bg-stone-50/80 dark:bg-zinc-900/80 border-y border-stone-200/60 dark:border-zinc-800">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase gradient-text-animated">
            Cómo funciona
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-2">
            Encontrá lo que necesitás en 4 pasos
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-3 max-w-lg mx-auto leading-relaxed">
            Simplificamos la conexión entre compradores y proveedores para que sea rápida, segura y sin complicaciones.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon
            const sc = stepColors[step.color]
            return (
              <div key={step.title} className="relative text-center sm:text-left group">
                {/* Connector line */}
                <div className="hidden lg:block absolute top-6 left-14 w-[calc(100%-3rem)] h-px bg-gradient-to-r from-stone-200 to-stone-200/50 dark:from-zinc-700 dark:to-zinc-700/50 -z-0" />
                {/* Step number + icon */}
                <div className={`relative z-10 inline-flex h-12 w-12 rounded-2xl ${sc.bg} ring-4 ${sc.ring} items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`h-5 w-5 ${sc.icon}`} />
                </div>
                <div className="inline-flex items-center gap-2.5 mb-2">
                  <span className={`text-xs font-bold ${sc.icon} tabular-nums bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md shadow-sm`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">{step.title}</h3>
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
