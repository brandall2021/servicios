import type { DefaultSession } from "next-auth"
import type { Prisma } from "@prisma/client"
import type { PUBLIC_USER_SELECT, PUBLIC_PROVIDER_SELECT } from "@/lib/auth-guard"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}

export type UserRole = "CLIENT" | "PROVIDER" | "ADMIN"

export type PublicUser = Prisma.UserGetPayload<{ select: typeof PUBLIC_USER_SELECT }>
export type PublicProvider = Prisma.UserGetPayload<{ select: typeof PUBLIC_PROVIDER_SELECT }>

export type ServicioWithRelations = Prisma.ServicioGetPayload<{
  include: {
    usuario: { select: typeof PUBLIC_PROVIDER_SELECT }
    fotos: { take: 1 }
    opiniones: {
      select: {
        id: true
        puntuacion: true
        comentario: true
        createdAt: true
        cliente: { select: typeof PUBLIC_USER_SELECT }
        fotos: { select: { id: true; archivo: true; tipo: true } }
      }
      take: 5
    }
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
        opiniones: {
          select: {
            id: true
            puntuacion: true
            comentario: true
            createdAt: true
            cliente: { select: typeof PUBLIC_USER_SELECT }
            fotos: { select: { id: true; archivo: true; tipo: true } }
          }
        }
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
    denunciante: { select: typeof PUBLIC_USER_SELECT }
    servicio: { select: { id: true; titulo: true; activo: true } }
    opinion: { select: { id: true; comentario: true; puntuacion: true } }
    usuario: { select: typeof PUBLIC_USER_SELECT }
  }
}>