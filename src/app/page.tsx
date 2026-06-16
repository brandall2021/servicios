import { prisma } from "@/lib/prisma"
import { HeroSearch } from "@/components/home/hero-search"
import { CategoryGrid } from "@/components/home/category-grid"
import { FeaturedServices } from "@/components/home/featured-services"
import { TrustMetrics } from "@/components/home/trust-metrics"
import type { ServicioWithRelations, ProviderWithStats } from "@/types"

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

async function getTopProviders(): Promise<ProviderWithStats[]> {
  const providers = await prisma.user.findMany({
    where: { role: "PROVIDER" },
    include: {
      _count: { select: { servicios: true, opiniones: true } },
      servicios: {
        where: { activo: true },
        include: {
          fotos: { take: 1 },
          opiniones: {
            include: { cliente: true, fotos: true },
          },
        },
        take: 3,
      },
    },
    take: 4,
  })

  return providers.map((p) => {
    const allOpiniones = p.servicios.flatMap((s) => s.opiniones)
    const avgRating =
      allOpiniones.length > 0
        ? allOpiniones.reduce((a, o) => a + o.puntuacion, 0) / allOpiniones.length
        : 0
    return { ...p, avgRating } as unknown as ProviderWithStats
  })
}

export default async function HomePage() {
  const [servicios] = await Promise.all([
    getDestacados(),
  ])

  return (
    <div>
      <HeroSearch />
      <CategoryGrid />
      <FeaturedServices servicios={servicios} />
      <TrustMetrics />
    </div>
  )
}
