import { prisma } from "@/lib/prisma"
import { ServiceCard } from "@/components/shared/service-card"
import { SearchBar } from "@/components/shared/search-bar"
import { CATEGORIAS } from "@/lib/constants"

interface Props {
  searchParams: Promise<{ q?: string; categoria?: string; ubicacion?: string }>
}

export default async function BuscarPage({ searchParams }: Props) {
  const params = await searchParams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { activo: true }

  if (params.q) {
    where.OR = [
      { titulo: { contains: params.q } },
      { descripcion: { contains: params.q } },
    ]
  }
  if (params.categoria) where.categoria = params.categoria
  if (params.ubicacion) where.ubicacion = { contains: params.ubicacion }

  const servicios = await prisma.servicio.findMany({
    where,
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
    take: 50,
  })

  const selectedCategoria = params.categoria || ""

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-4">Buscar servicios</h1>
        <SearchBar />
      </div>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <h3 className="font-semibold text-sm text-zinc-900 mb-3">Categorías</h3>
            <div className="space-y-1">
              <a
                href="/buscar"
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  !selectedCategoria
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                Todas
              </a>
              {CATEGORIAS.map((cat) => (
                <a
                  key={cat.value}
                  href={`/buscar?categoria=${cat.value}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategoria === cat.value
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {cat.icon} {cat.label}
                </a>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <p className="text-sm text-zinc-500 mb-4">
            {servicios.length} {servicios.length === 1 ? "servicio encontrado" : "servicios encontrados"}
          </p>
          {servicios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {servicios.map((s) => (
                <ServiceCard key={s.id} servicio={s} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-zinc-400 text-lg mb-2">No encontramos servicios</p>
              <p className="text-zinc-400 text-sm">Probá con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
