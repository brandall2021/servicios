import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PUBLIC_USER_SELECT, PUBLIC_PROVIDER_SELECT } from "@/lib/auth-guard"

const createServicioSchema = z.object({
  titulo: z.string().min(2).max(200),
  descripcion: z.string().min(2).max(5000),
  categoria: z.string().min(1).max(100),
  precio: z.string().optional(),
  precioTexto: z.string().max(200).optional(),
  ubicacion: z.string().max(200).optional(),
  disponibilidad: z.string().max(200).optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  fotos: z.array(z.string()).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "PROVIDER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = createServicioSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { titulo, descripcion, categoria, precio, precioTexto, ubicacion, disponibilidad, lat, lng, fotos } = parsed.data

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
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { activo: true }
  if (categoria) where.categoria = categoria
  if (q) {
    where.OR = [
      { titulo: { contains: q } },
      { descripcion: { contains: q } },
    ]
  }

  const [servicios, total] = await Promise.all([
    prisma.servicio.findMany({
      where,
      include: {
        usuario: { select: PUBLIC_PROVIDER_SELECT },
        fotos: { take: 1 },
        opiniones: {
          select: {
            id: true,
            puntuacion: true,
            comentario: true,
            createdAt: true,
            cliente: { select: PUBLIC_USER_SELECT },
            fotos: { select: { id: true, archivo: true, tipo: true } },
          },
          take: 5,
        },
        _count: { select: { opiniones: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.servicio.count({ where }),
  ])

  return NextResponse.json({
    servicios,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}
