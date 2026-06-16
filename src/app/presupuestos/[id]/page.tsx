import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BudgetDetail } from "./budget-detail"
import { notFound } from "next/navigation"

export default async function PresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params

  const request = await prisma.budgetRequest.findUnique({
    where: { id },
    include: {
      servicio: {
        include: { usuario: { select: { id: true, name: true, image: true, phone: true } } },
      },
      cliente: { select: { id: true, name: true, image: true } },
      cotizaciones: {
        orderBy: { version: "desc" },
        include: { proveedor: { select: { id: true, name: true, image: true } } },
      },
    },
  })

  if (!request) notFound()

  const isOwner = request.clienteId === session.user.id
  const isProvider = request.servicio.usuarioId === session.user.id
  if (!isOwner && !isProvider) redirect("/")

  const serialized = {
    ...request,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    cotizaciones: request.cotizaciones.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      validUntil: c.validUntil?.toISOString() ?? null,
    })),
  }

  return <BudgetDetail request={serialized} currentUserId={session.user.id} isProvider={isProvider} />
}
