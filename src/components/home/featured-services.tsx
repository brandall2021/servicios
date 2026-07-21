import Link from "next/link"
import { Button } from "../ui/button"
import { ServiceCard } from "../shared/service-card"
import { EmptyServicesState } from "./empty-services-state"
import type { ServicioWithRelations } from "@/types"
import { ArrowRight } from "lucide-react"

interface FeaturedServicesProps {
  servicios: ServicioWithRelations[]
}

export function FeaturedServices({ servicios }: FeaturedServicesProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase gradient-text-animated">
            Destacados
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-1.5">
            Servicios destacados
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">Los mejores servicios cerca de vos</p>
        </div>
        {servicios.length > 0 && (
          <Link href="/buscar">
            <Button variant="outline" size="sm" className="rounded-xl hidden sm:inline-flex gap-1.5 group">
              Ver todos
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {servicios.length > 0 ? (
          servicios.map((s, i) => <ServiceCard key={s.id} servicio={s} index={i} />)
        ) : (
          <EmptyServicesState />
        )}
      </div>
      {servicios.length > 0 && (
        <div className="mt-8 text-center sm:hidden">
          <Link href="/buscar">
            <Button variant="outline" className="rounded-xl gap-1.5">
              Ver todos los servicios
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  )
}
