import Link from "next/link"
import { SearchBar } from "@/components/shared/search-bar"
import { Button } from "@/components/ui/button"
import { CATEGORIAS } from "@/lib/constants"
import { prisma } from "@/lib/prisma"
import { ServiceCard } from "@/components/shared/service-card"
import { ProviderCard } from "@/components/shared/provider-card"
import { BadgeCheck, Star, Shield, MessageSquare, Users, TrendingUp } from "lucide-react"

async function getDestacados() {
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
  return servicios
}

async function getTopProviders() {
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
    return { ...p, avgRating }
  })
}

export default async function HomePage() {
  const [servicios, providers] = await Promise.all([
    getDestacados(),
    getTopProviders(),
  ])

  return (
    <div>
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Encontrá el profesional que necesitás
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-10">
              La plataforma más confiable para conectar clientes con proveedores verificados en Argentina.
            </p>
            <SearchBar />
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-blue-200">
              <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4" /> Profesionales verificados</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4" /> Opiniones reales</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Pago seguro</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIAS.map((cat) => (
            <Link
              key={cat.value}
              href={`/buscar?categoria=${cat.value}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 hover:bg-blue-50 hover:border-blue-200 border border-zinc-200 transition-all group"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-sm font-medium text-zinc-700 group-hover:text-blue-700">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">Servicios destacados</h2>
            <p className="text-zinc-500 mt-1">Los mejores servicios cerca de vos</p>
          </div>
          <Link href="/buscar">
            <Button variant="outline" size="sm">Ver todos</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.length > 0 ? (
            servicios.map((s) => <ServiceCard key={s.id} servicio={s} />)
          ) : (
            <p className="text-zinc-400 col-span-full text-center py-12">
              No hay servicios publicados aún. ¡Sé el primero!
            </p>
          )}
        </div>
      </section>

      {providers.length > 0 && (
        <section className="bg-zinc-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">Profesionales destacados</h2>
                <p className="text-zinc-500 mt-1">Los mejor calificados por la comunidad</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {providers.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8">
            <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-2">+10,000 Clientes</h3>
            <p className="text-sm text-zinc-500">Confían en nuestra plataforma para encontrar al profesional ideal</p>
          </div>
          <div className="p-8">
            <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-2">+2,300 Proveedores</h3>
            <p className="text-sm text-zinc-500">Profesionales verificados ofreciendo sus servicios</p>
          </div>
          <div className="p-8">
            <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-2">+75,000 Opiniones</h3>
            <p className="text-sm text-zinc-500">Calificaciones reales de trabajos realizados</p>
          </div>
        </div>
      </section>
    </div>
  )
}
