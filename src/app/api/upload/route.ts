import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const VALID_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "El archivo no puede superar los 10MB" }, { status: 400 })
    }

    const allValid = [...VALID_TYPES.image, ...VALID_TYPES.document]
    if (!allValid.includes(file.type)) {
      return NextResponse.json({
        error: "Formato no válido. Usá JPG, PNG, WebP, GIF, PDF, Word o Excel",
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    return NextResponse.json({ archivo: base64 })
  } catch {
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 })
  }
}
