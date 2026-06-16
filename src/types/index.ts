import type { DefaultSession } from "next-auth"
import type { Prisma } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}

export type UserRole = "CLIENT" | "PROVIDER" | "ADMIN"

export type ServicioWithRelations = Prisma.ServicioGetPayload<{
  include: {
    usuario: true
    fotos: { take: 1 }
    opiniones: { include: { cliente: true; fotos: true }; take: 5 }
    _count: { select: { opiniones: true } }
  }
}> & { distance?: number | null }

export type ProviderWithStats = Prisma.UserGetPayload<{
  include: {
    _count: { select: { servicios: true; opiniones: true } }
    servicios: {
      where: { activo: true }
      include: {
        fotos: { take: 1 }
        opiniones: { include: { cliente: true; fotos: true } }
      }
      take: 3
    }
  }
}> & { avgRating: number }

export type AdminUserWithCount = Prisma.UserGetPayload<{
  include: { _count: { select: { servicios: true; opiniones: true } } }
}>

export type AdminServicioWithUser = Prisma.ServicioGetPayload<{
  include: {
    usuario: { select: { id: true; name: true } }
    _count: { select: { opiniones: true } }
  }
}>

export type AdminReportWithRelations = Prisma.ReportGetPayload<{
  include: {
    denunciante: { select: { id: true; name: true } }
    servicio: { select: { id: true; titulo: true; activo: true } }
    opinion: { select: { id: true; comentario: true; puntuacion: true } }
    usuario: { select: { id: true; name: true; email: true } }
  }
}>
