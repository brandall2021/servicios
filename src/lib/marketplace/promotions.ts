import { PromotionType } from "@prisma/client"

export type PromotionTypeValue = PromotionType

export function normalizeCode(code?: string | null) {
  return code?.trim().toUpperCase() || null
}

export function isValidPercentage(value: number) {
  return value >= 1 && value <= 90
}
