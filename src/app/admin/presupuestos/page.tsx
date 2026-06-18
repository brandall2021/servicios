import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminPresupuestosList } from "./presupuestos-list"

export default async function AdminPresupuestosPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const requests = await prisma.budgetRequest.findMany({
    include: {
      cliente: { select: { id: true, name: true, email: true } },
      servicio: { select: { id: true, titulo: true } },
      cotizaciones: {
        include: {
          proveedor: { select: { id: true, name: true } },
        },
        orderBy: { version: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Presupuestos</h1>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{requests.length} solicitudes</span>
      </div>
      <AdminPresupuestosList requests={requests as any} />
    </div>
  )
}
