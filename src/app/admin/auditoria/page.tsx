import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Avatar } from "@/components/ui/avatar"
import { Shield, ShieldOff, Ban, Trash2, Plus, Pencil, UserCheck, UserX, Eye, EyeOff, MessageSquare, FileText } from "lucide-react"

const actionIcons: Record<string, React.ReactNode> = {
  cambio_rol: <Shield className="h-4 w-4 text-blue-500" />,
  banear: <Ban className="h-4 w-4 text-red-500" />,
  desbanear: <ShieldOff className="h-4 w-4 text-green-500" />,
  eliminar: <Trash2 className="h-4 w-4 text-red-600" />,
  crear_usuario: <Plus className="h-4 w-4 text-green-500" />,
  editar_usuario: <Pencil className="h-4 w-4 text-blue-500" />,
  aprobar_proveedor: <UserCheck className="h-4 w-4 text-green-500" />,
  rechazar_proveedor: <UserX className="h-4 w-4 text-orange-500" />,
  editar_servicio: <Pencil className="h-4 w-4 text-blue-500" />,
  activar_servicio: <Eye className="h-4 w-4 text-green-500" />,
  desactivar_servicio: <EyeOff className="h-4 w-4 text-zinc-500" />,
  editar_opinion: <MessageSquare className="h-4 w-4 text-blue-500" />,
  eliminar_opinion: <Trash2 className="h-4 w-4 text-red-600" />,
  editar_denuncia: <FileText className="h-4 w-4 text-orange-500" />,
}

const actionLabels: Record<string, string> = {
  cambio_rol: "Cambio de rol",
  banear: "Bloqueo",
  desbanear: "Desbloqueo",
  eliminar: "Eliminación",
  crear_usuario: "Creación",
  editar_usuario: "Edición",
  aprobar_proveedor: "Proveedor aprobado",
  rechazar_proveedor: "Solicitud rechazada",
  editar_servicio: "Servicio editado",
  activar_servicio: "Servicio activado",
  desactivar_servicio: "Servicio desactivado",
  editar_opinion: "Opinión editada",
  eliminar_opinion: "Opinión eliminada",
  editar_denuncia: "Denuncia actualizada",
}

export default async function AuditoriaPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const logs = await prisma.auditLog.findMany({
    include: {
      admin: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Auditoría</h1>
        <span className="text-sm text-zinc-500">{logs.length} registros</span>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800">
                <th className="text-left py-3 px-4 font-medium text-zinc-500 dark:text-zinc-400">Acción</th>
                <th className="text-left py-3 px-4 font-medium text-zinc-500 dark:text-zinc-400">Detalle</th>
                <th className="text-left py-3 px-4 font-medium text-zinc-500 dark:text-zinc-400">Admin</th>
                <th className="text-right py-3 px-4 font-medium text-zinc-500 dark:text-zinc-400">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-stone-100 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {actionIcons[log.accion] || <Shield className="h-4 w-4 text-zinc-400" />}
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {actionLabels[log.accion] || log.accion}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 max-w-md truncate">
                    {log.detalle}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Avatar src={log.admin.image} fallback={log.admin.name} size="sm" />
                      <span className="text-zinc-700 dark:text-zinc-300">{log.admin.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-400 text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-400">
                    No hay registros de auditoría
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
