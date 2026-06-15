import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return false
  return true
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const servicio = await prisma.servicio.update({
    where: { id },
    data: {
      activo: typeof body.activo === "boolean" ? body.activo : undefined,
    },
  })

  return NextResponse.json(servicio)
}
