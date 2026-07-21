import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { PUBLIC_PROVIDER_SELECT, PUBLIC_USER_SELECT } from "@/lib/auth-guard"
import { ServiceCard } from "@/components/shared/service-card"
import { SearchBar } from "@/components/shared/search-bar"
import { NearMeButton } from "@/components/shared/near-me-button"
import { CATEGORIAS } from "@/lib/constants"
import { SortSelect } from "./sort-select"
import { CategoryChips } from "./category-chips"
import type { ServicioWithRelations } from "@/types"

interface Props {
  searchParams: Promise<{ q?: string; categoria?: string; ubicacion?: string; lat?: string; lng?: string; radio?: string; sort?: string; verificado?: string; punt_min?: string; precio_min?: string; precio_max?: string; proveedor?: string }>
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
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-semibold text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-3">Categorías</h3>
              <div className="space-y-0.5">
                <a
                  href="/buscar"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    !selectedCategoria
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-medium"
                      : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  Todos
                </a>
                {CATEGORIAS.map((cat) => (
                  <a
                    key={cat.value}
                    href={`/buscar?categoria=${cat.value}`}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      selectedCategoria === cat.value
                        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-medium"
                        : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span>{cat.icon}</span> {cat.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-3">Cerca de mí</h3>
              <NearMeButton />
            </div>

            <div className="border-t border-stone-200/70 dark:border-zinc-700/50 pt-4 space-y-4">
              <h3 className="font-semibold text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400">Filtros</h3>

              <label className="flex items-center gap-2.5 text-sm text-stone-600 dark:text-stone-400 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={params.verificado === "true"}
                  onChange={(e) => {
                    const url = new URL(window.location.href)
                    if (e.target.checked) url.searchParams.set("verificado", "true")
                    else url.searchParams.delete("verificado")
                    window.location.href = url.toString()
                  }}
                  className="rounded border-stone-300 dark:border-zinc-600 text-orange-600 focus:ring-orange-500/30"
                />
                Solo verificados
              </label>

              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1.5">Puntaje mínimo</label>
                <select
                  defaultValue={params.punt_min || ""}
                  onChange={(e) => {
                    const url = new URL(window.location.href)
                    if (e.target.value) url.searchParams.set("punt_min", e.target.value)
                    else url.searchParams.delete("punt_min")
                    window.location.href = url.toString()
                  }}
                  className="w-full h-9 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl text-xs bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                >
                  <option value="">Cualquier puntaje</option>
                  <option value="4">4 ★ o más</option>
                  <option value="3">3 ★ o más</option>
                  <option value="2">2 ★ o más</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1.5">Precio mínimo</label>
                <input
                  type="number"
                  defaultValue={params.precio_min || ""}
                  placeholder="$0"
                  onBlur={(e) => {
                    const url = new URL(window.location.href)
                    if (e.target.value) url.searchParams.set("precio_min", e.target.value)
                    else url.searchParams.delete("precio_min")
                    window.location.href = url.toString()
                  }}
                  className="w-full h-9 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl text-xs bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1.5">Precio máximo</label>
                <input
                  type="number"
                  defaultValue={params.precio_max || ""}
                  placeholder="$999999"
                  onBlur={(e) => {
                    const url = new URL(window.location.href)
                    if (e.target.value) url.searchParams.set("precio_max", e.target.value)
                    else url.searchParams.delete("precio_max")
                    window.location.href = url.toString()
                  }}
                  className="w-full h-9 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl text-xs bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1.5">Nombre del proveedor</label>
                <input
                  type="text"
                  defaultValue={params.proveedor || ""}
                  placeholder="Buscar por nombre..."
                  onBlur={(e) => {
                    const url = new URL(window.location.href)
                    if (e.target.value) url.searchParams.set("proveedor", e.target.value)
                    else url.searchParams.delete("proveedor")
                    window.location.href = url.toString()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const url = new URL(window.location.href)
                      if ((e.target as HTMLInputElement).value) url.searchParams.set("proveedor", (e.target as HTMLInputElement).value)
                      else url.searchParams.delete("proveedor")
                      window.location.href = url.toString()
                    }
                  }}
                  className="w-full h-9 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl text-xs bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {servicios.length} {servicios.length === 1 ? "servicio encontrado" : "servicios encontrados"}
              {params.lat && params.lng && " (ordenados por cercanía)"}
            </p>
            <div className="flex items-center gap-2">
              {params.lat && params.lng && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-stone-500 dark:text-stone-400">Radio:</label>
                  <select
                    className="h-9 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl text-xs bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
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
              <SortSelect />
            </div>
          </div>
          {servicios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {servicios.map((s, i) => (
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
        </div>
      </div>
    </div>
  )
}
