import { prisma } from "@/lib/prisma"
import { ServiceCard } from "@/components/shared/service-card"
import { SearchBar } from "@/components/shared/search-bar"
import { NearMeButton } from "@/components/shared/near-me-button"
import { CATEGORIAS } from "@/lib/constants"

interface Props {
  searchParams: Promise<{ q?: string; categoria?: string; ubicacion?: string; lat?: string; lng?: string; radio?: string }>
}

async function getServicios(params: Awaited<Props["searchParams"]>) {
  const lat = params.lat ? parseFloat(params.lat) : null
  const lng = params.lng ? parseFloat(params.lng) : null
  const radio = params.radio ? parseFloat(params.radio) : null
  const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)

  if (hasCoords && radio !== null && !isNaN(radio)) {
    const whereClauses: string[] = ['s.activo = true', 's.lat IS NOT NULL', 's.lng IS NOT NULL']
    const queryParams: unknown[] = [lat, lng, lat, lng]

    if (params.categoria) {
      whereClauses.push(`s.categoria = $${queryParams.length + 1}`)
      queryParams.push(params.categoria)
    }
    if (params.q) {
      whereClauses.push(`(s.titulo ILIKE $${queryParams.length + 1} OR s.descripcion ILIKE $${queryParams.length + 2})`)
      queryParams.push(`%${params.q}%`, `%${params.q}%`)
    }

    queryParams.push(radio)

    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>(`
      SELECT s.*, u.id AS u_id, u.name AS u_name, u.email AS u_email, u.image AS u_image, u.role AS u_role,
        (6371 * acos(
          cos(radians($1::float)) * cos(radians(s.lat)) *
          cos(radians(s.lng) - radians($2::float)) +
          sin(radians($3::float)) * sin(radians(s.lat))
        )) AS distance
      FROM "Servicio" s
      JOIN "User" u ON u.id = s."usuarioId"
      WHERE ${whereClauses.join(" AND ")}
        AND (6371 * acos(
          cos(radians($1::float)) * cos(radians(s.lat)) *
          cos(radians(s.lng) - radians($2::float)) +
          sin(radians($3::float)) * sin(radians(s.lat))
        )) <= $${queryParams.length}::float
      ORDER BY distance ASC
      LIMIT 50
    `, ...queryParams)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rows.map((r: any) => ({
      id: r.id,
      titulo: r.titulo,
      descripcion: r.descripcion,
      categoria: r.categoria,
      precio: r.precio,
      precioTexto: r.precioTexto,
      ubicacion: r.ubicacion,
      lat: r.lat,
      lng: r.lng,
      disponibilidad: r.disponibilidad,
      activo: r.activo,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      usuarioId: r.usuarioId,
      distance: r.distance ? parseFloat(r.distance) : null,
      usuario: {
        id: r.u_id,
        name: r.u_name,
        email: r.u_email,
        image: r.u_image,
        role: r.u_role,
      },
      fotos: [],
      opiniones: [],
      _count: { opiniones: 0 },
    }))
  }

  const where: Record<string, unknown> = { activo: true }

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

  return servicios.map((s) => ({ ...s, distance: null }))
}

export default async function BuscarPage({ searchParams }: Props) {
  const params = await searchParams
  const servicios = await getServicios(params)

  const selectedCategoria = params.categoria || ""

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-4">Buscar servicios</h1>
        <SearchBar />
      </div>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
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

            <div>
              <h3 className="font-semibold text-sm text-zinc-900 mb-3">Cerca de mí</h3>
              <NearMeButton />
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-zinc-500">
              {servicios.length} {servicios.length === 1 ? "servicio encontrado" : "servicios encontrados"}
              {params.lat && params.lng && ` (ordenados por cercanía)`}
            </p>
            {params.lat && params.lng && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500">Radio:</label>
                <select
                  className="h-8 px-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-600 outline-none focus:border-emerald-500"
                  onChange={(e) => {
                    const url = new URL(window.location.href)
                    url.searchParams.set("radio", e.target.value)
                    window.location.href = url.toString()
                  }}
                  defaultValue={params.radio || "50"}
                >
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                  <option value="100">100 km</option>
                  <option value="200">200 km</option>
                </select>
              </div>
            )}
          </div>
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
