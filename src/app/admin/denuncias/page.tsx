import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminReportList } from "./report-list"
import type { AdminReportWithRelations } from "@/types"
import { PUBLIC_USER_SELECT } from "@/lib/auth-guard"

export default async function AdminDenunciasPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const reports: AdminReportWithRelations[] = await prisma.report.findMany({
    include: {
      denunciante: { select: PUBLIC_USER_SELECT },
      servicio: { select: { id: true, titulo: true, activo: true } },
      opinion: { select: { id: true, comentario: true, puntuacion: true } },
      usuario: { select: PUBLIC_USER_SELECT },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Denuncias</h1>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{reports.length} denuncias</span>
      </div>
      <AdminReportList reports={reports as any} />
    </div>
  )
}
