import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { servicioId, puntuacion, comentario, recaptchaToken } = await req.json()

    if (!recaptchaToken) {
      return NextResponse.json({ error: "reCAPTCHA requerido" }, { status: 400 })
    }

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

    if (!servicioId || !puntuacion || puntuacion < 1 || puntuacion > 5) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      )
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
      },
    })

    return NextResponse.json(opinion, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear opinión" }, { status: 500 })
  }
}
