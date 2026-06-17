import Link from "next/link"
import { Button } from "../ui/button"
import { ServiceCard } from "../shared/service-card"
import { EmptyServicesState } from "./empty-services-state"
import type { ServicioWithRelations } from "@/types"

interface FeaturedServicesProps {
  servicios: ServicioWithRelations[]
}

export function FeaturedServices({ servicios }: FeaturedServicesProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase rainbow-text">
            Destacados
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mt-1">
            Servicios destacados
          </h2>
          <p className="text-sm text-stone-500 mt-1">Los mejores servicios cerca de vos</p>
        </div>
        {servicios.length > 0 && (
          <Link href="/buscar">
            <Button variant="outline" size="sm" className="rounded-xl hidden sm:inline-flex">
              Ver todos
            </Button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {servicios.length > 0 ? (
          servicios.map((s) => <ServiceCard key={s.id} servicio={s} />)
        ) : (
          <EmptyServicesState />
        )}
      </div>
      {servicios.length > 0 && (
        <div className="mt-8 text-center sm:hidden">
          <Link href="/buscar">
            <Button variant="outline" className="rounded-xl">
              Ver todos los servicios
            </Button>
          </Link>
        </div>
      )}
    </section>
  )
}
