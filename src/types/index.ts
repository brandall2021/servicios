import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}

export type UserRole = "CLIENT" | "PROVIDER" | "ADMIN"

export interface ServicioWithRelations {
  id: string
  titulo: string
  descripcion: string
  categoria: string
  precio: number | null
  precioTexto: string | null
  ubicacion: string | null
  disponibilidad: string | null
  activo: boolean
  createdAt: Date
  usuario: {
    id: string
    name: string
    email: string
    image: string | null
    role: string
  }
  fotos: { id: string; archivo: string }[]
  opiniones: {
    id: string
    puntuacion: number
    comentario: string | null
    createdAt: Date
    cliente: { id: string; name: string; image: string | null }
    fotos: { id: string; archivo: string }[]
  }[]
  _count?: { opiniones: number }
}

export interface ProviderWithStats {
  id: string
  name: string
  email: string
  image: string | null
  phone: string | null
  description: string | null
  experience: string | null
  certifications: string | null
  zone: string | null
  availability: string | null
  verified: boolean
  _count: {
    servicios: number
    opiniones: number
  }
  avgRating: number
  servicios: ServicioWithRelations[]
}
