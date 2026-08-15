import { BookingStatus, Prisma } from "@prisma/client"

export type BookingStatusType = BookingStatus

export function hasBookingOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && startB < endA
}

export function parseDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error("Fecha inválida")
  return date
}

export function toDecimal(value: string | number) {
  return new Prisma.Decimal(String(value))
}
