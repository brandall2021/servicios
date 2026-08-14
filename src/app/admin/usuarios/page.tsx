import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { AdminUserList, type AdminUserRow } from "./user-list"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Pagination } from "@/components/shared/pagination"

const PAGE_SIZE = 20
type RoleFilter = "all" | "CLIENT" | "PROVIDER" | "ADMIN"
type StatusFilter = "all" | "pending" | "verified" | "blocked"

interface Props {
  searchParams: Promise<{ q?: string; role?: string; status?: string; page?: string }>
}

export default async function AdminUsuariosPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const params = await searchParams
  const q = params.q?.trim() || ""
  const role = (params.role || "all") as RoleFilter
  const status = (params.status || "all") as StatusFilter
  const page = Math.max(1, Number(params.page || 1))

  const where: Prisma.UserWhereInput = {}
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { rubro: { contains: q, mode: "insensitive" } },
    ]
  }
  if (role !== "all") where.role = role
  if (status === "pending") {
    where.solicitudProveedor = true
    where.verified = false
    where.baneado = false
  }
  if (status === "verified") where.verified = true
  if (status === "blocked") where.baneado = true

  const total = await prisma.user.count({ where })

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, pages)

  const usuarios: AdminUserRow[] = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      rubro: true,
      role: true,
      verified: true,
      baneado: true,
      motivoBaneo: true,
      solicitudProveedor: true,
      createdAt: true,
      _count: { select: { servicios: true, opiniones: true } },
    },
  })

  const totalLabel = total.toLocaleString()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Usuarios</h1>
        <span className="text-sm text-zinc-500">{totalLabel} usuarios</span>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5" method="get">
        <Input id="q" name="q" placeholder="Buscar por nombre, email, teléfono o rubro" defaultValue={q} />
        <Select
          id="role"
          name="role"
          defaultValue={role}
          options={[
            { value: "all", label: "Todos los roles" },
            { value: "CLIENT", label: "Clientes" },
            { value: "PROVIDER", label: "Proveedores" },
            { value: "ADMIN", label: "Admins" },
          ]}
        />
        <Select
          id="status"
          name="status"
          defaultValue={status}
          options={[
            { value: "all", label: "Todos los estados" },
            { value: "pending", label: "Pendientes proveedor" },
            { value: "verified", label: "Verificados" },
            { value: "blocked", label: "Bloqueados" },
          ]}
        />
        <div className="flex gap-2">
          <button type="submit" className="rounded-xl px-4 py-2 text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors">
            Filtrar
          </button>
          <a href="/admin/usuarios" className="rounded-xl px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Limpiar
          </a>
        </div>
      </form>

      <AdminUserList usuarios={usuarios} />

      <Pagination page={currentPage} pages={pages} total={total} label="usuarios" />
    </div>
  )
}
