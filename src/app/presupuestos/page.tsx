import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BudgetList } from "./budget-list"
import Link from "next/link"
import { FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BudgetRequestItem } from "./budget-list"

export default async function PresupuestosPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  type BudgetRequestRow = {
    id: string
    description: string | null
    materiales: string | null
    status: string
    createdAt: Date
    servicio: { id: string; titulo: string; categoria: string }
    cliente: { id: string; name: string; image: string | null } | null
    cotizaciones: { amount: number; version: number; proveedor: { id: string; name: string } }[]
  }

  const [misSolicitudes, cotizacionesPendientes] = await Promise.all([
    prisma.budgetRequest.findMany({
      where: { clienteId: session.user.id },
      include: {
        servicio: { select: { id: true, titulo: true, categoria: true } },
        cliente: { select: { id: true, name: true, image: true } },
        cotizaciones: { orderBy: { version: "desc" }, take: 1, include: { proveedor: { select: { id: true, name: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    session.user.role === "PROVIDER" || session.user.role === "ADMIN"
      ? prisma.budgetRequest.findMany({
          where: { servicio: { usuarioId: session.user.id } },
          include: {
            servicio: { select: { id: true, titulo: true, categoria: true } },
            cliente: { select: { id: true, name: true, image: true } },
            cotizaciones: { orderBy: { version: "desc" }, take: 1, include: { proveedor: { select: { id: true, name: true } } } },
          },
          orderBy: { updatedAt: "desc" },
        })
    : [],
  ]) as [BudgetRequestRow[], BudgetRequestRow[]]

  const isProvider = session.user.role === "PROVIDER" || session.user.role === "ADMIN"

  function serializeDates(items: BudgetRequestRow[]): BudgetRequestItem[] {
    return items.map((item) => ({
      id: item.id,
      description: item.description,
      materiales: item.materiales,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      servicio: item.servicio,
      cliente: item.cliente ? { id: item.cliente.id, name: item.cliente.name, image: item.cliente.image } : undefined,
      cotizaciones: item.cotizaciones.map((c) => ({
        amount: Number(c.amount),
        version: c.version,
        proveedor: c.proveedor,
      })),
    }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 animate-fade-in">
        <span className="text-xs font-semibold tracking-widest uppercase gradient-text-animated">
          Presupuestos
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-1">
          Presupuestos
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">Gestioná tus solicitudes de presupuesto</p>
      </div>

      {isProvider && cotizacionesPendientes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
            Solicitudes recibidas ({cotizacionesPendientes.length})
          </h2>
          <BudgetList requests={serializeDates(cotizacionesPendientes)} rol="proveedor" />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Mis solicitudes ({misSolicitudes.length})
          </h2>
        </div>
        {misSolicitudes.length > 0 ? (
          <BudgetList requests={serializeDates(misSolicitudes)} rol="cliente" />
        ) : (
          <div className="text-center py-16 bg-stone-50 dark:bg-zinc-800/30 rounded-2xl border border-stone-200/60 dark:border-zinc-700/30">
            <div className="h-12 w-12 rounded-2xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-stone-400" />
            </div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">No tenés solicitudes</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">Solicitá un presupuesto personalizado a un proveedor</p>
            <Link href="/buscar">
              <Button variant="outline" className="rounded-xl">
                Explorar servicios <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
