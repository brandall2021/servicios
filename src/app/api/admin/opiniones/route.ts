import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return false
  return true
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const opiniones = await prisma.opinion.findMany({
    include: {
      cliente: { select: { id: true, name: true, email: true } },
      servicio: { select: { id: true, titulo: true } },
      _count: { select: { reportes: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(opiniones)
}
