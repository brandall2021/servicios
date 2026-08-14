import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { PUBLIC_PROVIDER_SELECT, PUBLIC_USER_SELECT } from "@/lib/auth-guard"
import { ServiceCard } from "@/components/shared/service-card"
import { SearchBar } from "@/components/shared/search-bar"
import { Pagination } from "@/components/shared/pagination"
import { CATEGORIAS } from "@/lib/constants"
import { SortSelect } from "./sort-select"
import { CategoryChips } from "./category-chips"
import { FilterSidebar, RadioSelect } from "./filter-sidebar"
import type { ServicioWithRelations } from "@/types"

interface Props {
  searchParams: Promise<{ q?: string; categoria?: string; ubicacion?: string; lat?: string; lng?: string; radio?: string; sort?: string; verificado?: string; punt_min?: string; precio_min?: string; precio_max?: string; proveedor?: string; page?: string }>
}

async function getServicios(params: Awaited<Props["searchParams"]>) {
  const lat = params.lat ? parseFloat(params.lat) : null
  const lng = params.lng ? parseFloat(params.lng) : null
  const radio = params.radio ? parseFloat(params.radio) : null
  const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)

  async function fetchServicios(where: Record<string, unknown>, orderBy: Record<string, string>) {
    return prisma.servicio.findMany({
      where,
      include: {
        usuario: { select: { ...PUBLIC_PROVIDER_SELECT, verified: true } },
        fotos: { take: 1 },
        opiniones: {
          select: { puntuacion: true },
        },
        _count: { select: { opiniones: true } },
      },
      orderBy,
      take: 50,
    })
  }

  const puntMin = params.punt_min ? parseFloat(params.punt_min) : null
  const precioMin = params.precio_min ? parseFloat(params.precio_min) : null
  const precioMax = params.precio_max ? parseFloat(params.precio_max) : null

  function buildWhere(): Record<string, unknown> {
    const w: Record<string, unknown> = { activo: true }

    if (params.q) {
      w.OR = [
        { titulo: { contains: params.q, mode: "insensitive" } },
        { descripcion: { contains: params.q, mode: "insensitive" } },
      ]
    }
    if (params.categoria) w.categoria = params.categoria
    if (params.ubicacion) w.ubicacion = { contains: params.ubicacion, mode: "insensitive" }
    if (params.proveedor) {
      w.usuario = {
        name: { contains: params.proveedor, mode: "insensitive" },
      }
    }
    if (params.verificado === "true") {
      w.usuario = { ...(w.usuario as object || {}), verified: true }
    }
    if (precioMin !== null || precioMax !== null) {
      const precioFilter: Record<string, unknown> = {}
      if (precioMin !== null) precioFilter.gte = precioMin
      if (precioMax !== null) precioFilter.lte = precioMax
      w.precio = precioFilter
    }

    return w
  }

  const buildOrderBy = (): Record<string, string> => {
    if (params.sort === "precio_asc") return { precio: "asc" }
    if (params.sort === "precio_desc") return { precio: "desc" }
    if (params.sort === "rating") return {} // handled post-filter
    return { createdAt: "desc" }
  }

  if (hasCoords && radio !== null && !isNaN(radio)) {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`s.activo = true`,
      Prisma.sql`s.lat IS NOT NULL`,
      Prisma.sql`s.lng IS NOT NULL`,
    ]

    if (params.categoria) conditions.push(Prisma.sql`s.categoria = ${params.categoria}`)
    if (params.q) {
      const pattern = `%${params.q}%`
      conditions.push(Prisma.sql`(s.titulo ILIKE ${pattern} OR s.descripcion ILIKE ${pattern})`)
    }
    if (precioMin !== null) conditions.push(Prisma.sql`s.precio >= ${precioMin}`)
    if (precioMax !== null) conditions.push(Prisma.sql`s.precio <= ${precioMax}`)

    const whereClause = Prisma.join(conditions, " AND ")
    const hav = Prisma.sql`cos(radians(${lat})) * cos(radians(s.lat)) * cos(radians(s.lng) - radians(${lng})) + sin(radians(${lat})) * sin(radians(s.lat))`

    const rows = await prisma.$queryRaw<Array<{ id: string; distance: number }>>(Prisma.sql`
      SELECT s.id, (6371 * acos(${hav})) AS distance
      FROM "Servicio" s
      INNER JOIN "User" u ON s."usuarioId" = u.id
      WHERE ${whereClause}
        AND (6371 * acos(${hav})) <= ${radio}
        ${params.verificado === "true" ? Prisma.sql`AND u.verified = true` : Prisma.empty}
        ${params.proveedor ? Prisma.sql`AND u.name ILIKE ${"%" + params.proveedor + "%"}` : Prisma.empty}
      ORDER BY distance ASC
      LIMIT 50
    `)

    const ids = rows.map((r) => r.id)
    if (ids.length === 0) return []

    const servicios = await fetchServicios({ id: { in: ids } }, {})
    const distanceMap = new Map(rows.map((r) => [r.id, r.distance]))
    return servicios
      .map((s) => ({ ...s, distance: distanceMap.get(s.id) ?? null }))
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
  }

  const orderBy = buildOrderBy()
  let servicios = await fetchServicios(buildWhere(), orderBy)

  // Post-filter by rating
  if (puntMin !== null) {
    servicios = servicios.filter((s) => {
      const avg =
        s.opiniones.length > 0
          ? s.opiniones.reduce((a: number, o: { puntuacion: number }) => a + o.puntuacion, 0) / s.opiniones.length
          : 0
      return avg >= puntMin
    })
  }

  if (params.sort === "rating") {
    servicios.sort((a, b) => {
      const avgA =
        a.opiniones.length > 0
          ? a.opiniones.reduce((acc: number, o: { puntuacion: number }) => acc + o.puntuacion, 0) / a.opiniones.length
          : 0
      const avgB =
        b.opiniones.length > 0
          ? b.opiniones.reduce((acc: number, o: { puntuacion: number }) => acc + o.puntuacion, 0) / b.opiniones.length
          : 0
      return avgB - avgA
    })
  }

  return servicios.map((s) => ({ ...s, distance: null }))
}

export default async function BuscarPage({ searchParams }: Props) {
  const params = await searchParams
  const servicios = await getServicios(params)
  const page = Math.max(1, parseInt(params.page || "1"))
  const pageSize = 12
  const total = servicios.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, pages)
  const pagedServicios = servicios.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const selectedCategoria = params.categoria || ""

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-4">
          {params.q ? `Resultados para "${params.q}"` : "Buscar servicios"}
        </h1>
        <SearchBar />
      </div>

      <CategoryChips
        categorias={CATEGORIAS}
        selected={selectedCategoria}
      />

      <div className="flex gap-6 mt-6">
        <FilterSidebar
          verificado={params.verificado || ""}
          puntMin={params.punt_min || ""}
          precioMin={params.precio_min || ""}
          precioMax={params.precio_max || ""}
          proveedor={params.proveedor || ""}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {servicios.length} {servicios.length === 1 ? "servicio encontrado" : "servicios encontrados"}
              {params.lat && params.lng && " (ordenados por cercanía)"}
            </p>
            <div className="flex items-center gap-2">
              {params.lat && params.lng && (
                <RadioSelect radio={params.radio || "50"} />
              )}
              <SortSelect />
            </div>
          </div>
          {pagedServicios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {pagedServicios.map((s, i) => (
                <ServiceCard key={s.id} servicio={s as ServicioWithRelations} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="h-16 w-16 rounded-2xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <p className="text-stone-700 dark:text-stone-300 font-semibold text-lg mb-1">No encontramos servicios</p>
              <p className="text-stone-500 dark:text-stone-400 text-sm">Probá con otros términos de búsqueda o categoría</p>
            </div>
          )}

          {total > pageSize && (
            <Pagination page={currentPage} pages={pages} total={total} label="servicios" />
          )}
        </div>
      </div>
    </div>
  )
}
