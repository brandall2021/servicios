import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminOpinionesList } from "./opiniones-list"

export default async function AdminOpinionesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const opiniones = await prisma.opinion.findMany({
    include: {
      cliente: { select: { id: true, name: true } },
      servicio: { select: { id: true, titulo: true } },
      _count: { select: { reportes: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Opiniones</h1>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{opiniones.length} opiniones</span>
      </div>
      <AdminOpinionesList opiniones={opiniones as any} />
    </div>
  )
}
