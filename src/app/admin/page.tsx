import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Star, AlertTriangle } from "lucide-react"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const totals = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.servicio.count(),
    prisma.opinion.count(),
  ])

  const [totalUsers, totalClients, totalProviders, totalServicios, totalOpiniones] = totals

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Panel de Administración</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Usuarios</p>
                <p className="text-2xl font-bold text-zinc-900">{totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-zinc-400">
              {totalClients} clientes &middot; {totalProviders} proveedores
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Servicios</p>
                <p className="text-2xl font-bold text-zinc-900">{totalServicios.toLocaleString()}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Reportes</p>
                <p className="text-2xl font-bold text-zinc-900">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
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
            <a
              href="/admin/usuarios"
              className="block p-3 rounded-lg bg-zinc-50 hover:bg-blue-50 transition-colors"
            >
              <p className="font-medium text-zinc-900">Usuarios</p>
              <p className="text-sm text-zinc-500">Gestionar clientes y proveedores</p>
            </a>
            <a
              href="/admin/categorias"
              className="block p-3 rounded-lg bg-zinc-50 hover:bg-blue-50 transition-colors"
            >
              <p className="font-medium text-zinc-900">Categorías</p>
              <p className="text-sm text-zinc-500">Administrar categorías de servicios</p>
            </a>
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
                <span className="text-zinc-500">Servicios publicados</span>
                <span className="font-medium">{totalServicios.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Opiniones</span>
                <span className="font-medium">{totalOpiniones.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
