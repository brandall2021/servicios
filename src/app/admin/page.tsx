import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Star, AlertTriangle, FileText, ScrollText } from "lucide-react"
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
    totalPresupuestos,
    totalAuditLogs,
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
    prisma.budgetRequest.count(),
    prisma.auditLog.count(),
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
      <div className="mb-8 animate-fade-in">
        <span className="text-xs font-semibold tracking-widest uppercase gradient-text-animated">
          Admin
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-1">
          Panel de Administración
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/usuarios" className="animate-fade-in" style={{ animationDelay: "0ms" }}>
          <Card className="hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer hover:-translate-y-0.5 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-stone-500 dark:text-stone-400">Usuarios</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">{totalUsers.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="mt-3 text-xs text-stone-500 dark:text-stone-400">
                {totalClients} clientes · {totalProviders} proveedores
                {totalBaneados > 0 && <span className="text-red-500"> · {totalBaneados} bloqueados</span>}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/servicios" className="animate-fade-in" style={{ animationDelay: "60ms" }}>
          <Card className="hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer hover:-translate-y-0.5 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-stone-500 dark:text-stone-400">Servicios</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">{totalServicios.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <Briefcase className="h-5 w-5 text-green-600" />
                </div>
              </div>
              {serviciosInactivos > 0 && (
                <div className="mt-3 text-xs text-red-500">{serviciosInactivos} inactivos</div>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/denuncias" className="animate-fade-in" style={{ animationDelay: "120ms" }}>
          <Card className={`hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer hover:-translate-y-0.5 group ${reportsPendientes > 0 ? "ring-2 ring-yellow-300/50" : ""}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-stone-500 dark:text-stone-400">Denuncias</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">{totalReports.toLocaleString()}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                  reportsPendientes > 0 ? "bg-yellow-50 dark:bg-yellow-900/20 group-hover:bg-yellow-100" : "bg-stone-100 dark:bg-zinc-800"
                }`}>
                  <AlertTriangle className={`h-5 w-5 ${reportsPendientes > 0 ? "text-yellow-500" : "text-stone-400"}`} />
                </div>
              </div>
              {reportsPendientes > 0 && (
                <div className="mt-3 text-xs text-yellow-600 dark:text-yellow-500 font-medium">{reportsPendientes} pendientes</div>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/opiniones" className="animate-fade-in" style={{ animationDelay: "180ms" }}>
          <Card className="hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer hover:-translate-y-0.5 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-stone-500 dark:text-stone-400">Opiniones</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">{totalOpiniones.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30 transition-colors">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/presupuestos" className="animate-fade-in" style={{ animationDelay: "240ms" }}>
          <Card className="hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer hover:-translate-y-0.5 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-stone-500 dark:text-stone-400">Presupuestos</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">{totalPresupuestos.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/auditoria" className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <Card className="hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer hover:-translate-y-0.5 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-stone-500 dark:text-stone-400">Auditoría</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">{totalAuditLogs.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                  <ScrollText className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">Registros por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminDashboardChart data={monthlyData} maxValue={maxRegistrations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">Por categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {servicesByCategory
              .sort((a, b) => b.count - a.count)
              .map((cat) => (
                <div key={cat.value} className="flex items-center justify-between text-sm">
                  <span className="text-stone-600 dark:text-stone-400 flex items-center gap-2">
                    <span>{cat.icon}</span>
                    {cat.label}
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{cat.count}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">Denuncias pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <p className="text-sm text-stone-400 dark:text-stone-500">No hay denuncias pendientes</p>
            ) : (
              <div className="space-y-3">
                {recentReports.map((r) => (
                  <div key={r.id} className="flex items-start justify-between text-sm p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-100">{r.motivo}</p>
                      <p className="text-stone-500 dark:text-stone-400 text-xs mt-0.5">
                        {r.denunciante.name}{r.servicio ? ` — ${r.servicio.titulo}` : ""}
                      </p>
                    </div>
                    <Link
                      href="/admin/denuncias"
                      className="text-orange-600 hover:text-orange-700 text-xs font-medium shrink-0"
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
            <CardTitle className="text-sm font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">Últimos registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{u.name}</p>
                    <p className="text-stone-500 dark:text-stone-400 text-xs">{u.email}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    u.role === "PROVIDER"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300"
                  }`}>
                    {u.role === "PROVIDER" ? "Proveedor" : "Cliente"}
                  </span>
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
