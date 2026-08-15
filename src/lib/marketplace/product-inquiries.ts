import { InquiryStatus, Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export type ProductInquiryStatus = InquiryStatus

export async function getOpenProductInquiry(clientId: string, providerId: string) {
  return prisma.productInquiry.findFirst({
    where: { clientId, providerId, status: InquiryStatus.DRAFT },
    include: {
      items: { include: { listing: true } },
      quotes: { orderBy: { version: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getProductInquiryById(id: string, userId: string, isAdmin = false) {
  const where = isAdmin
    ? { id }
    : {
        id,
        OR: [
          { clientId: userId },
          { providerId: userId },
        ],
      }

  return prisma.productInquiry.findFirst({
    where,
    include: {
      client: { select: { id: true, name: true, image: true } },
      provider: { select: { id: true, name: true, image: true, whatsapp: true, website: true, verified: true } },
      items: { include: { listing: { include: { provider: true, category: true, product: true, media: { take: 1 } } } } },
      quotes: { orderBy: { version: "desc" }, include: { provider: { select: { id: true, name: true, image: true } } } },
    },
  })
}

export async function getProductInquiriesForUser(userId: string) {
  return prisma.productInquiry.findMany({
    where: { OR: [{ clientId: userId }, { providerId: userId }] },
    include: {
      client: { select: { id: true, name: true, image: true } },
      provider: { select: { id: true, name: true, image: true, whatsapp: true, website: true, verified: true } },
      items: { include: { listing: { include: { provider: true, category: true, product: true, media: { take: 1 } } } } },
      quotes: { orderBy: { version: "desc" }, take: 1, include: { provider: { select: { id: true, name: true, image: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export function parseInquiryQuantity(value: string | number) {
  return new Prisma.Decimal(String(value))
}

export function isInquiryTerminal(status: InquiryStatus) {
  return status === InquiryStatus.ACCEPTED || status === InquiryStatus.REJECTED || status === InquiryStatus.EXPIRED || status === InquiryStatus.CANCELLED
}
