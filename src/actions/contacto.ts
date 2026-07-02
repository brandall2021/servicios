"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function registrarContacto(
  tipo: string,
  targetId: string,
  targetType: string,
) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Debés iniciar sesión" }
  }

  await prisma.contactView.create({
    data: {
      tipo,
      targetId,
      targetType,
      userId: session.user.id,
    },
  })

  return { success: true }
}
