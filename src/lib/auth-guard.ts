import { auth } from "./auth"
import { NextResponse } from "next/server"

export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  image: true,
  verified: true,
  zone: true,
  trabajosRealizados: true,
} as const

export const PUBLIC_PROVIDER_SELECT = {
  id: true,
  name: true,
  image: true,
  verified: true,
  zone: true,
  trabajosRealizados: true,
  whatsapp: true,
  description: true,
  experience: true,
  certifications: true,
  availability: true,
} as const

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 })
}

export function forbidden() {
  return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw unauthorized()
  return session
}

export async function requireRole(role: string) {
  const session = await requireAuth()
  if (session.user.role !== role) throw forbidden()
  return session
}

export async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function requireAdmin() {
  return requireRole("ADMIN")
}

export async function isOwner(ownerId: string) {
  const session = await auth()
  return session?.user?.id === ownerId
}

export async function isProvider() {
  const session = await auth()
  return session?.user?.role === "PROVIDER"
}
