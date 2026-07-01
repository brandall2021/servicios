import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, PUBLIC_USER_SELECT } from "@/lib/auth-guard"

export async function GET() {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const opiniones = await prisma.opinion.findMany({
    include: {
      cliente: { select: PUBLIC_USER_SELECT },
      servicio: { select: { id: true, titulo: true } },
      _count: { select: { reportes: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(opiniones)
}
