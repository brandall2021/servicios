import { Search, MessageSquareText, Star, ShieldCheck } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Buscá",
    description: "Encontrá el servicio que necesitás filtrando por categoría, ubicación y precio.",
    color: "emerald",
  },
  {
    icon: MessageSquareText,
    title: "Consultá",
    description: "Charlá directamente con el proveedor, resolvé tus dudas y acordá los detalles.",
    color: "cyan",
  },
  {
    icon: Star,
    title: "Elegí",
    description: "Compará opiniones reales de otros clientes y elegí con confianza.",
    color: "amber",
  },
  {
    icon: ShieldCheck,
    title: "Contratá",
    description: "Trabajá con profesionales verificados. Tu satisfacción es lo más importante.",
    color: "purple",
  },
]

const stepColors: Record<string, { bg: string; icon: string }> = {
  emerald: { bg: "bg-emerald-100", icon: "text-emerald-600" },
  cyan: { bg: "bg-cyan-100", icon: "text-cyan-600" },
  amber: { bg: "bg-amber-100", icon: "text-amber-600" },
  purple: { bg: "bg-purple-100", icon: "text-purple-600" },
}

export function TrustMetrics() {
  return (
    <section className="bg-stone-50/80 border-y border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase rainbow-text">
            Cómo funciona
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mt-1">
            Encontrá al profesional ideal en 4 pasos
          </h2>
          <p className="text-sm text-stone-500 mt-2 max-w-lg mx-auto">
            Simplificamos la conexión entre clientes y proveedores para que sea rápida, segura y sin complicaciones.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon
            const sc = stepColors[step.color]
            return (
              <div key={step.title} className="relative text-center sm:text-left">
                <div className="hidden lg:block absolute top-3 left-14 w-[calc(100%-3rem)] h-px bg-stone-200 -z-0" />
                <div className={`relative z-10 inline-flex h-10 w-10 rounded-xl ${sc.bg} items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${sc.icon}`} />
                </div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold ${sc.icon} tabular-nums`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-semibold text-stone-900">{step.title}</h3>
                </div>
                <p className="text-sm text-stone-500 leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
