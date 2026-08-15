import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getProductInquiryById } from "@/lib/marketplace/product-inquiries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductInquiryActions } from "@/components/shared/product-inquiry-actions"

interface Props {
  params: Promise<{ id: string }>
}

function statusLabel(status: string) {
  switch (status) {
    case "DRAFT": return "Borrador"
    case "SENT": return "Enviada"
    case "RESPONDED": return "Respondida"
    case "ACCEPTED": return "Aceptada"
    case "REJECTED": return "Rechazada"
    case "EXPIRED": return "Vencida"
    case "CANCELLED": return "Cancelada"
    default: return status
  }
}

export default async function ProductInquiryDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect(`/login?returnTo=${encodeURIComponent("/consultas/productos")}`)

  const { id } = await params
  const inquiry = await getProductInquiryById(id, session.user.id, session.user.role === "ADMIN")
  if (!inquiry) notFound()

  const isClient = inquiry.clientId === session.user.id
  const isProvider = inquiry.providerId === session.user.id
  const quote = inquiry.quotes[0] || null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Consulta</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Detalle de producto</h1>
        </div>
        <Link href="/consultas/productos">
          <Button variant="outline" className="rounded-xl">Volver a consultas</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{statusLabel(inquiry.status)}</Badge>
              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{inquiry.provider.name}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Cliente" value={inquiry.client.name} />
              <Info label="Proveedor" value={inquiry.provider.name} />
              <Info label="Consulta" value={inquiry.id} mono />
              <Info label="Estado" value={statusLabel(inquiry.status)} />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">Ítems</p>
              {inquiry.items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-stone-200 p-4 dark:border-zinc-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-100">{item.titleSnapshot}</p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">{item.quantity.toString()} {item.requestedUnit}</p>
                    </div>
                    <span className="text-sm font-semibold text-orange-600">{item.priceSnapshot ? `$${item.priceSnapshot.toString()}` : "A confirmar"}</span>
                  </div>
                  {item.notes && <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 whitespace-pre-line">{item.notes}</p>}
                </div>
              ))}
            </div>

            {quote && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/15">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-300">Última cotización</p>
                <p className="mt-1 text-2xl font-bold text-orange-800 dark:text-orange-100">${quote.amount.toString()}</p>
                {quote.breakdown && <p className="mt-2 text-sm text-orange-900/80 dark:text-orange-100/80 whitespace-pre-line">{quote.breakdown}</p>}
                {quote.conditions && <p className="mt-2 text-sm text-orange-900/80 dark:text-orange-100/80 whitespace-pre-line">{quote.conditions}</p>}
              </div>
            )}

            <ProductInquiryActions
              inquiryId={inquiry.id}
              status={inquiry.status}
              isClient={isClient}
              isProvider={isProvider}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">Participantes</p>
              <div>
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">Cliente</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">{inquiry.client.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">Proveedor</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">{inquiry.provider.name}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">Resumen</p>
              <p className="text-sm text-stone-600 dark:text-stone-300">Esta consulta está en estado <span className="font-medium text-stone-900 dark:text-stone-100">{statusLabel(inquiry.status)}</span>.</p>
              <p className="text-sm text-stone-600 dark:text-stone-300">{isProvider ? "Podés enviar una cotización o cambiar el estado." : "Podés revisar la cotización y aceptar o rechazarla."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1">{label}</p>
      <p className={`text-sm font-medium text-stone-900 dark:text-stone-100 ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</p>
    </div>
  )
}
