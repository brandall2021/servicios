import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { name, phone, description, experience, certifications, zone, availability, whatsapp } = await req.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(description !== undefined && { description }),
        ...(experience !== undefined && { experience }),
        ...(certifications !== undefined && { certifications }),
        ...(zone !== undefined && { zone }),
        ...(availability !== undefined && { availability }),
        ...(whatsapp !== undefined && { whatsapp }),
      },
    })

    return NextResponse.json({ id: user.id, name: user.name })
  } catch {
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 })
  }
}
