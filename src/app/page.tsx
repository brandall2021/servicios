import { prisma } from "@/lib/prisma"
import { HeroSearch } from "@/components/home/hero-search"
import { CategoryGrid } from "@/components/home/category-grid"
import { FeaturedServices } from "@/components/home/featured-services"
import { TrustMetrics } from "@/components/home/trust-metrics"
import { PUBLIC_PROVIDER_SELECT, PUBLIC_USER_SELECT } from "@/lib/auth-guard"
import type { ServicioWithRelations } from "@/types"

async function getDestacados(): Promise<ServicioWithRelations[]> {
  const servicios = await prisma.servicio.findMany({
    where: { activo: true },
    include: {
      usuario: { select: PUBLIC_PROVIDER_SELECT },
      fotos: { take: 1 },
      opiniones: {
        select: {
          id: true,
          puntuacion: true,
          comentario: true,
          createdAt: true,
          cliente: { select: PUBLIC_USER_SELECT },
          fotos: { select: { id: true, archivo: true, tipo: true } },
        },
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
      <CategoryGrid />
      <FeaturedServices servicios={servicios} />
      <TrustMetrics />
    </div>
  )
}
