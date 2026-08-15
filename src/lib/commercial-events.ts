import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export type CommercialEventType =
  | "SEARCH_PERFORMED"
  | "LISTING_VIEWED"
  | "FAVORITE_ADDED"
  | "FAVORITE_REMOVED"
  | "COMPARE_ADDED"
  | "COMPARE_REMOVED"
  | "CONTACT_REVEALED"

interface LogCommercialEventInput {
  type: CommercialEventType | string
  userId: string
  sessionId: string
  providerId?: string | null
  listingId?: string | null
  requestId?: string | null
  metadata?: Record<string, unknown> | null
}

export async function logCommercialEvent(input: LogCommercialEventInput) {
  await prisma.commercialEvent.create({
    data: {
      type: input.type,
      userId: input.userId,
      sessionId: input.sessionId,
      providerId: input.providerId ?? null,
      listingId: input.listingId ?? null,
      requestId: input.requestId ?? null,
      ...(input.metadata ? { metadata: input.metadata as Prisma.InputJsonValue } : {}),
    },
  })
}
