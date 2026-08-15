import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PromotionComposeForm } from "@/components/shared/promotion-compose-form"
import { PromotionRow } from "@/components/shared/promotion-row"

export default async function ProveedorPromocionesPage() {
  const session = await auth()
  if (!session?.user) redirect(`/login?returnTo=${encodeURIComponent("/proveedor/promociones")}`)
  if (session.user.role !== "PROVIDER" && session.user.role !== "ADMIN") redirect("/")

  const promotions = await prisma.promotion.findMany({
    where: { providerId: session.user.id },
    include: { listing: { select: { id: true, title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Promociones</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Panel</h1>
        </div>
        <Link href="/proveedor/metricas"><Button variant="outline" className="rounded-xl">Ir a métricas</Button></Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <PromotionComposeForm />

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">Promociones existentes</h2>
            <div className="space-y-3">
              {promotions.length > 0 ? promotions.map((promotion) => (
                <PromotionRow
                  key={promotion.id}
                  promotion={{
                    id: promotion.id,
                    listingTitle: promotion.listing?.title || null,
                    active: promotion.active,
                    type: promotion.type,
                    name: promotion.name,
                    code: promotion.code,
                    value: promotion.value?.toString() || null,
                    startsAt: promotion.startsAt.toISOString(),
                    endsAt: promotion.endsAt.toISOString(),
                    terms: promotion.terms,
                    listingId: promotion.listingId,
                  }}
                />
              )) : (
                <p className="text-sm text-stone-500 dark:text-stone-400">Todavía no creaste promociones.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
