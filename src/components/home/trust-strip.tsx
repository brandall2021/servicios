import { FileCheck2, ShieldCheck, MessagesSquare, MapPin } from "lucide-react"

const items = [
  {
    icon: FileCheck2,
    title: "Perfiles completos",
    description: "Datos de contacto, zona y disponibilidad visibles.",
  },
  {
    icon: ShieldCheck,
    title: "Reputación visible",
    description: "Valoraciones y trabajos realizados a la vista.",
  },
  {
    icon: MessagesSquare,
    title: "Contacto directo",
    description: "Consultá y pedí presupuestos sin intermediarios.",
  },
  {
    icon: MapPin,
    title: "Datos reales",
    description: "Publicaciones con ubicación y precios concretos.",
  },
]

export function TrustStrip() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="rounded-[32px] border border-stone-200/70 bg-stone-50/85 px-5 sm:px-8 py-6 dark:border-zinc-800 dark:bg-zinc-900/55">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#0B2A55] dark:bg-[#163B70] text-orange-400 flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{item.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
