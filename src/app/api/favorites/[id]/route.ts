import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logCommercialEvent } from "@/lib/commercial-events"

interface Props {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const favorite = await prisma.favorite.findFirst({ where: { id, userId: session.user.id } })
  if (!favorite) return NextResponse.json({ success: true })

  await prisma.favorite.delete({ where: { id } })
  await logCommercialEvent({
    type: "FAVORITE_REMOVED",
    userId: session.user.id,
    sessionId: session.user.id,
    providerId: favorite.providerId,
    listingId: favorite.listingId,
    metadata: { favoriteType: favorite.type },
  })

  return NextResponse.json({ success: true })
}
