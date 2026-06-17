import { prisma } from "@/lib/prisma"
import { HeroSearch } from "@/components/home/hero-search"
import { CategoryGrid } from "@/components/home/category-grid"
import { FeaturedServices } from "@/components/home/featured-services"
import { TrustMetrics } from "@/components/home/trust-metrics"
import type { ServicioWithRelations } from "@/types"

async function getDestacados(): Promise<ServicioWithRelations[]> {
  const servicios = await prisma.servicio.findMany({
    where: { activo: true },
    include: {
      usuario: true,
      fotos: { take: 1 },
      opiniones: {
        include: { cliente: true, fotos: true },
        take: 5,
      },
      _count: { select: { opiniones: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  })
  return servicios as unknown as ServicioWithRelations[]
}

export default async function HomePage() {
  const [servicios] = await Promise.all([
    getDestacados(),
  ]) as [ServicioWithRelations[]]

  return (
    <div>
      <HeroSearch />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rainbow-divider" />
      </div>
      <CategoryGrid />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rainbow-divider" />
      </div>
      <FeaturedServices servicios={servicios} />
      <div className="rainbow-divider max-w-7xl mx-auto px-4 sm:px-6" />
      <TrustMetrics />
    </div>
  )
}
