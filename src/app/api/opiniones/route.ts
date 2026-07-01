import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notifyNewOpinion } from "@/lib/notifications"

const createOpinionSchema = z.object({
  servicioId: z.string().min(1),
  puntuacion: z.number().int().min(1).max(5),
  comentario: z.string().max(2000).optional(),
  recaptchaToken: z.string().min(1),
  fotos: z.array(z.string()).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = createOpinionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const { servicioId, puntuacion, comentario, recaptchaToken, fotos } = parsed.data

    const recaptchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY || "",
        response: recaptchaToken,
      }),
    })

    const recaptchaData = await recaptchaRes.json()
    if (!recaptchaData.success) {
      return NextResponse.json({ error: "reCAPTCHA inválido" }, { status: 400 })
    }

    const existing = await prisma.opinion.findFirst({
      where: { servicioId, clienteId: session.user.id },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Ya calificaste este servicio" },
        { status: 400 }
      )
    }

    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId },
    })

    if (!servicio || servicio.usuarioId === session.user.id) {
      return NextResponse.json(
        { error: "No podés calificar tu propio servicio" },
        { status: 400 }
      )
    }

    const opinion = await prisma.opinion.create({
      data: {
        puntuacion,
        comentario,
        servicioId,
        clienteId: session.user.id,
        fotos: fotos?.length
          ? { create: fotos.map((archivo: string) => ({ archivo, tipo: "OPINION" })) }
          : undefined,
      },
    })

    await notifyNewOpinion(servicioId, servicio.titulo, servicio.usuarioId, puntuacion)

    return NextResponse.json(opinion, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear opinión" }, { status: 500 })
  }
}
