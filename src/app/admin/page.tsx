import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Star, AlertTriangle } from "lucide-react"
import { CATEGORIAS } from "@/lib/constants"
import Link from "next/link"
import { AdminDashboardChart } from "./dashboard-chart"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [
    totalUsers,
    totalClients,
    totalProviders,
    totalServicios,
    serviciosInactivos,
    totalOpiniones,
    totalReports,
    reportsPendientes,
    totalBaneados,
    monthlyRegistrations,
    servicesByCategory,
    recentReports,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.servicio.count(),
    prisma.servicio.count({ where: { activo: false } }),
    prisma.opinion.count(),
    prisma.report.count(),
    prisma.report.count({ where: { estado: "PENDIENTE" } }),
    prisma.user.count({ where: { baneado: true } }),
    prisma.user.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: sixMonthsAgo } },
      _count: { id: true },
      orderBy: { createdAt: "asc" },
    }),
    Promise.all(
      CATEGORIAS.map(async (cat) => {
        const count = await prisma.servicio.count({ where: { categoria: cat.value } })
        return { label: cat.label, value: cat.value, count, icon: cat.icon }
      })
    ),
    prisma.report.findMany({
      where: { estado: "PENDIENTE" },
      include: {
        denunciante: { select: { name: true } },
        servicio: { select: { titulo: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ])

  const monthlyData = aggregateByMonth(monthlyRegistrations, sixMonthsAgo, now)
  const maxRegistrations = Math.max(...monthlyData.map((m) => m.count), 1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Panel de Administración</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/usuarios">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Usuarios</p>
                  <p className="text-2xl font-bold text-zinc-900">{totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2 text-xs text-zinc-400">
                {totalClients} clientes &middot; {totalProviders} proveedores
                {totalBaneados > 0 && <span className="text-red-500"> &middot; {totalBaneados} bloqueados</span>}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/servicios">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Servicios</p>
                  <p className="text-2xl font-bold text-zinc-900">{totalServicios.toLocaleString()}</p>
                </div>
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
              {serviciosInactivos > 0 && (
                <div className="mt-2 text-xs text-red-500">{serviciosInactivos} inactivos</div>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/denuncias">
          <Card className={`hover:shadow-md transition-shadow cursor-pointer ${reportsPendientes > 0 ? "border-yellow-300" : ""}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Denuncias</p>
                  <p className="text-2xl font-bold text-zinc-900">{totalReports.toLocaleString()}</p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${reportsPendientes > 0 ? "text-yellow-500" : "text-zinc-400"}`} />
              </div>
              {reportsPendientes > 0 && (
                <div className="mt-2 text-xs text-yellow-600 font-medium">{reportsPendientes} pendientes</div>
              )}
            </CardContent>
          </Card>
        </Link>

          <Link href="/admin/opiniones">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">Opiniones</p>
                    <p className="text-2xl font-bold text-zinc-900">{totalOpiniones.toLocaleString()}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Registros por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminDashboardChart data={monthlyData} maxValue={maxRegistrations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Servicios por categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {servicesByCategory
              .sort((a, b) => b.count - a.count)
              .map((cat) => (
                <div key={cat.value} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 flex items-center gap-1.5">
                    <span>{cat.icon}</span>
                    {cat.label}
                  </span>
                  <span className="font-medium text-zinc-900">{cat.count}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Denuncias pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <p className="text-sm text-zinc-400">No hay denuncias pendientes</p>
            ) : (
              <div className="space-y-3">
                {recentReports.map((r) => (
                  <div key={r.id} className="flex items-start justify-between text-sm">
                    <div>
                      <p className="font-medium text-zinc-900">{r.motivo}</p>
                      <p className="text-zinc-500 text-xs">
                        {r.denunciante.name}{r.servicio ? ` — ${r.servicio.titulo}` : ""}
                      </p>
                    </div>
                    <Link
                      href="/admin/denuncias"
                      className="text-orange-600 hover:text-orange-700 text-xs font-medium"
                    >
                      Revisar
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Últimos registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-zinc-900">{u.name}</p>
                    <p className="text-zinc-500 text-xs">{u.email}</p>
                  </div>
                  <Badge variant={u.role === "PROVIDER" ? "success" : "secondary"} className="text-[10px]">
                    {u.role === "PROVIDER" ? "Proveedor" : "Cliente"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function aggregateByMonth(
  data: { createdAt: Date; _count: { id: number } }[],
  from: Date,
  to: Date
): { month: string; count: number }[] {
  const months: { month: string; count: number }[] = []
  const cursor = new Date(from)
  while (cursor <= to) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`
    const label = new Intl.DateTimeFormat("es-AR", { month: "short", year: "2-digit" }).format(cursor)
    const count = data
      .filter((d) => {
        const dk = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, "0")}`
        return dk === key
      })
      .reduce((sum, d) => sum + d._count.id, 0)
    months.push({ month: label.replace(".", ""), count })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}

function Badge({ variant, className, children }: { variant: string; className?: string; children: React.ReactNode }) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
  const colors: Record<string, string> = {
    default: "bg-orange-600 text-white",
    secondary: "bg-zinc-100 text-zinc-800",
    success: "bg-green-100 text-green-800",
    destructive: "bg-red-100 text-red-800",
  }
  return <span className={`${base} ${colors[variant] || colors.secondary} ${className || ""}`}>{children}</span>
}
