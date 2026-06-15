import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminUserList } from "./user-list"

export default async function AdminUsuariosPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { servicios: true, opiniones: true } },
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Usuarios</h1>
        <span className="text-sm text-zinc-500">{usuarios.length} usuarios</span>
      </div>
      <AdminUserList usuarios={usuarios as any} />
    </div>
  )
}
