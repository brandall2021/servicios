import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getMarketplaceListingDetail } from "@/lib/marketplace/detail"
import { getProductInquiriesForUser, getProductInquiryById } from "@/lib/marketplace/product-inquiries"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductInquiryComposeForm } from "@/components/shared/product-inquiry-compose-form"
import { MarketplaceCard } from "@/components/shared/marketplace-card"
import { ProductInquiryActions } from "@/components/shared/product-inquiry-actions"

interface Props {
  searchParams: Promise<{ listingId?: string; inquiryId?: string }>
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

export default async function ConsultasProductosPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect(`/login?returnTo=${encodeURIComponent("/consultas/productos")}`)

  const params = await searchParams
  const inquiries = await getProductInquiriesForUser(session.user.id)
  const selectedInquiry = params.inquiryId ? await getProductInquiryById(params.inquiryId, session.user.id, session.user.role === "ADMIN") : null
  const selectedListing = params.listingId ? await getMarketplaceListingDetail(params.listingId, session.user.id, session.user.role === "ADMIN", { includeInactive: true }) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Consultas</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Productos</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Armá una consulta por proveedor y guardá tu pedido sin comprar todavía.</p>
      </div>

      {selectedListing && selectedListing.type === "PRODUCT" && selectedListing.product && (
        <div className="mb-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <MarketplaceCard listing={selectedListing} />
          <ProductInquiryComposeForm
            listingId={selectedListing.id}
            productUnit={selectedListing.product.unit || "unidad"}
            minimumOrder={selectedListing.product.minimumOrder?.toString() || null}
          />
        </div>
      )}

      {selectedInquiry ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Consulta seleccionada</p>
                <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">{selectedInquiry.provider.name}</h2>
              </div>
              <Badge variant="secondary">{statusLabel(selectedInquiry.status)}</Badge>
            </div>

            <div className="space-y-3">
              {selectedInquiry.items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-stone-200 p-4 dark:border-zinc-700">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-100">{item.titleSnapshot}</p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">{item.quantity.toString()} {item.requestedUnit}</p>
                    </div>
                    <span className="text-sm font-semibold text-orange-600">{item.priceSnapshot ? `$${item.priceSnapshot.toString()}` : "A confirmar"}</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedInquiry.quotes[0] ? (
              <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/15">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-300">Última cotización</p>
                <p className="mt-1 text-2xl font-bold text-orange-800 dark:text-orange-100">${selectedInquiry.quotes[0].amount.toString()}</p>
                {selectedInquiry.quotes[0].breakdown && <p className="mt-2 text-sm text-orange-900/80 dark:text-orange-100/80 whitespace-pre-line">{selectedInquiry.quotes[0].breakdown}</p>}
              </div>
            ) : null}

            <div className="mt-5">
              <ProductInquiryActions
                inquiryId={selectedInquiry.id}
                status={selectedInquiry.status}
                isClient={selectedInquiry.clientId === session.user.id}
                isProvider={selectedInquiry.providerId === session.user.id}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {inquiries.map((inquiry) => (
          <Link key={inquiry.id} href={`/consultas/productos/${inquiry.id}`} className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-orange-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">{inquiry.clientId === session.user.id ? "Tu consulta" : "Consulta recibida"}</p>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">{inquiry.provider.name}</h3>
              </div>
              <Badge variant="secondary">{statusLabel(inquiry.status)}</Badge>
            </div>
            <div className="space-y-2">
              {inquiry.items.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-stone-600 dark:text-stone-300">{item.titleSnapshot}</span>
                  <span className="font-medium text-stone-900 dark:text-stone-100">{item.quantity.toString()} {item.requestedUnit}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {inquiries.length === 0 && !selectedListing && (
        <div className="rounded-3xl border border-dashed border-stone-300 p-10 text-center dark:border-zinc-700">
          <p className="text-lg font-semibold text-stone-900 dark:text-stone-100">Todavía no tenés consultas</p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Abrí un producto y agregalo a una consulta para pedir disponibilidad y precio final.</p>
          <div className="mt-5">
            <Link href="/buscar?type=PRODUCT"><Button className="rounded-xl">Explorar productos</Button></Link>
          </div>
        </div>
      )}
    </div>
  )
}
