import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BudgetList } from "./budget-list"
import Link from "next/link"
import { FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function PresupuestosPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [misSolicitudes, cotizacionesPendientes] = await Promise.all([
    prisma.budgetRequest.findMany({
      where: { clienteId: session.user.id },
      include: {
        servicio: { select: { id: true, titulo: true, categoria: true } },
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
  ])

  const isProvider = session.user.role === "PROVIDER" || session.user.role === "ADMIN"

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Presupuestos</h1>
          <p className="text-sm text-stone-500 mt-1">Gestioná tus solicitudes de presupuesto</p>
        </div>
      </div>

      {isProvider && cotizacionesPendientes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">
            Solicitudes recibidas ({cotizacionesPendientes.length})
          </h2>
          <BudgetList requests={cotizacionesPendientes} rol="proveedor" />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
            Mis solicitudes ({misSolicitudes.length})
          </h2>
        </div>
        {misSolicitudes.length > 0 ? (
          <BudgetList requests={misSolicitudes} rol="cliente" />
        ) : (
          <div className="text-center py-16 bg-stone-50 rounded-xl border border-stone-200/60">
            <div className="h-12 w-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-stone-400" />
            </div>
            <h3 className="font-semibold text-stone-900 mb-1">No tenés solicitudes</h3>
            <p className="text-sm text-stone-500 mb-4">Solicitá un presupuesto personalizado a un proveedor</p>
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
