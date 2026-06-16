import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminServiceList } from "./service-list"
import type { AdminServicioWithUser } from "@/types"

export default async function AdminServiciosPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const servicios: AdminServicioWithUser[] = await prisma.servicio.findMany({
    include: {
      usuario: { select: { id: true, name: true } },
      _count: { select: { opiniones: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Servicios</h1>
        <span className="text-sm text-zinc-500">{servicios.length} servicios</span>
      </div>
      <AdminServiceList servicios={servicios as any} />
    </div>
  )
}
