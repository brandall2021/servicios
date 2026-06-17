import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROVIDER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { titulo, descripcion, categoria, precio, precioTexto, ubicacion, disponibilidad, lat, lng, fotos } = await req.json()

    if (!titulo || !descripcion || !categoria) {
      return NextResponse.json(
        { error: "Título, descripción y categoría son requeridos" },
        { status: 400 }
      )
    }

    const servicio = await prisma.servicio.create({
      data: {
        titulo,
        descripcion,
        categoria,
        precio: precio ? parseFloat(precio) : null,
        precioTexto,
        ubicacion,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        disponibilidad,
        usuarioId: session.user.id,
        fotos: fotos?.length
          ? { create: fotos.map((archivo: string) => ({ archivo, tipo: "SERVICIO" })) }
          : undefined,
      },
    })

    return NextResponse.json(servicio, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear el servicio" }, { status: 500 })
}
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const categoria = searchParams.get("categoria")
  const q = searchParams.get("q")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { activo: true }
  if (categoria) where.categoria = categoria
  if (q) {
    where.OR = [
      { titulo: { contains: q } },
      { descripcion: { contains: q } },
    ]
  }

  const servicios = await prisma.servicio.findMany({
    where,
    include: {
      usuario: true,
      fotos: { take: 1 },
      opiniones: {
        include: { cliente: true, fotos: true },
        take: 5,
      },
      _count: { select: { opiniones: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(servicios)
}
