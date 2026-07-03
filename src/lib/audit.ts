import { prisma } from "./prisma"
import { auth } from "./auth"

type AuditAction =
  | "cambio_rol"
  | "banear"
  | "desbanear"
  | "eliminar"
  | "crear_usuario"
  | "editar_usuario"
  | "aprobar_proveedor"
  | "rechazar_proveedor"

export async function logAdminAction(
  accion: AuditAction,
  detalle: string,
  targetId?: string,
) {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.auditLog.create({
    data: {
      accion,
      detalle,
      adminId: session.user.id,
      targetId: targetId || null,
    },
  })
}
