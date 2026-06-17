import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Star, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const totals = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.servicio.count(),
    prisma.servicio.count({ where: { activo: false } }),
    prisma.opinion.count(),
    prisma.report.count(),
    prisma.report.count({ where: { estado: "PENDIENTE" } }),
    prisma.user.count({ where: { baneado: true } }),
  ])

  const [totalUsers, totalClients, totalProviders, totalServicios, serviciosInactivos, totalOpiniones, totalReports, reportsPendientes, totalBaneados] = totals

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Panel de Administración</h1>

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
                {totalClients} clientes · {totalProviders} proveedores
                {totalBaneados > 0 && <span className="text-red-500"> · {totalBaneados} bloqueados</span>}
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

        <Card>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gestión Rápida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/admin/usuarios"
              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 hover:bg-orange-50 transition-colors"
            >
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-zinc-900">Usuarios</p>
                <p className="text-sm text-zinc-500">Verificar, bloquear o eliminar usuarios</p>
              </div>
            </Link>
            <Link
              href="/admin/servicios"
              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 hover:bg-orange-50 transition-colors"
            >
              <Briefcase className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-zinc-900">Servicios</p>
                <p className="text-sm text-zinc-500">Activar o desactivar servicios publicados</p>
              </div>
            </Link>
            <Link
              href="/admin/denuncias"
              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 hover:bg-orange-50 transition-colors"
            >
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium text-zinc-900">Denuncias</p>
                <p className="text-sm text-zinc-500">
                  {reportsPendientes > 0
                    ? `${reportsPendientes} denuncias pendientes de revisar`
                    : "Gestionar denuncias de usuarios"}
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Clientes</span>
                <span className="font-medium">{totalClients.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Proveedores</span>
                <span className="font-medium">{totalProviders.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Servicios activos</span>
                <span className="font-medium">{(totalServicios - serviciosInactivos).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Servicios inactivos</span>
                <span className="font-medium text-red-600">{serviciosInactivos.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Opiniones</span>
                <span className="font-medium">{totalOpiniones.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Denuncias pendientes</span>
                <span className="font-medium text-yellow-600">{reportsPendientes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Usuarios bloqueados</span>
                <span className="font-medium text-red-600">{totalBaneados.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
