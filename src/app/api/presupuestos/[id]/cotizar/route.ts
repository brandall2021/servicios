import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const { amount, breakdown, notes, validUntil } = await req.json()

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 })
  }

  try {
    const request = await prisma.budgetRequest.findUnique({
      where: { id },
      include: { servicio: true },
    })
    if (!request) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }
    if (request.servicio.usuarioId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const lastVersion = await prisma.budgetQuote.findFirst({
      where: { requestId: id },
      orderBy: { version: "desc" },
      select: { version: true },
    })

    const quote = await prisma.budgetQuote.create({
      data: {
        amount,
        breakdown,
        notes,
        validUntil: validUntil ? new Date(validUntil) : null,
        version: (lastVersion?.version ?? 0) + 1,
        requestId: id,
        proveedorId: session.user.id,
      },
    })

    await prisma.budgetRequest.update({
      where: { id },
      data: { status: "COTIZADO" },
    })

    return NextResponse.json(quote, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear cotización" }, { status: 500 })
  }
}
