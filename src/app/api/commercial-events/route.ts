import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { logCommercialEvent } from "@/lib/commercial-events"

const schema = z.object({
  type: z.string().min(1),
  listingId: z.string().optional(),
  providerId: z.string().optional(),
  requestId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  await logCommercialEvent({
    type: parsed.data.type,
    userId: session.user.id,
    sessionId: session.user.id,
    listingId: parsed.data.listingId ?? null,
    providerId: parsed.data.providerId ?? null,
    requestId: parsed.data.requestId ?? null,
    metadata: parsed.data.metadata ?? null,
  })

  return NextResponse.json({ success: true })
}
