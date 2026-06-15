import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"

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
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Usuarios</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="text-left py-3 px-4 font-medium text-zinc-500">Usuario</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">Email</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">Rol</th>
              <th className="text-center py-3 px-4 font-medium text-zinc-500">Servicios</th>
              <th className="text-center py-3 px-4 font-medium text-zinc-500">Opiniones</th>
              <th className="text-center py-3 px-4 font-medium text-zinc-500">Verificado</th>
              <th className="text-right py-3 px-4 font-medium text-zinc-500">Registro</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Avatar src={u.image} fallback={u.name} size="sm" />
                    <span className="font-medium text-zinc-900">{u.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-zinc-500">{u.email}</td>
                <td className="py-3 px-4">
                  <Badge variant={u.role === "ADMIN" ? "default" : u.role === "PROVIDER" ? "success" : "secondary"}>
                    {u.role === "ADMIN" ? "Admin" : u.role === "PROVIDER" ? "Proveedor" : "Cliente"}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center text-zinc-500">{u._count.servicios}</td>
                <td className="py-3 px-4 text-center text-zinc-500">{u._count.opiniones}</td>
                <td className="py-3 px-4 text-center">
                  {u.verified ? (
                    <Badge variant="success">Sí</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </td>
                <td className="py-3 px-4 text-right text-zinc-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
