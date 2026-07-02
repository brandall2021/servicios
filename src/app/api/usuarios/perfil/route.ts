import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const updatePerfilSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  experience: z.string().max(2000).nullable().optional(),
  certifications: z.string().max(2000).nullable().optional(),
  zone: z.string().max(200).nullable().optional(),
  availability: z.string().max(500).nullable().optional(),
  whatsapp: z.string().max(30).nullable().optional(),
  website: z.string().max(500).nullable().optional(),
  facebook: z.string().max(500).nullable().optional(),
  instagram: z.string().max(500).nullable().optional(),
})

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = updatePerfilSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
    })

    return NextResponse.json({ id: user.id, name: user.name })
  } catch {
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 })
  }
}
