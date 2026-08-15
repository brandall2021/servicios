import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getFavoriteEntries } from "@/lib/marketplace/favorites"
import { MarketplaceCard } from "@/components/shared/marketplace-card"
import { ProviderCard } from "@/components/shared/provider-card"
import { PendingFavoritesSync } from "@/components/shared/pending-favorites-sync"
import { Button } from "@/components/ui/button"
import { FavoriteToggleButton } from "@/components/shared/favorite-toggle-button"

interface Props {
  searchParams: Promise<{ view?: string }>
}

function TabLink({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${active ? "border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-300" : "border-stone-200 bg-white text-stone-600 hover:border-orange-300 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-300"}`}
    >
      {label}
      <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-inherit dark:bg-white/10">{count}</span>
    </Link>
  )
}

export default async function FavoritosPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) {
    redirect(`/login?returnTo=${encodeURIComponent("/favoritos")}`)
  }

  const params = await searchParams
  const view = params.view || "all"
  const entries = await getFavoriteEntries(session.user.id)

  const listingEntries = entries.filter((entry) => entry.listing)
  const providerEntries = entries.filter((entry) => entry.provider)

  const visibleListings = listingEntries.filter((entry) => {
    if (view === "services") return entry.listing?.type === "SERVICE"
    if (view === "products") return entry.listing?.type === "PRODUCT"
    return true
  })
  const visibleProviders = view === "providers" || view === "all" ? providerEntries : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Guardados</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Favoritos</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Servicios, productos y proveedores que guardaste para volver más tarde.</p>
      </div>

      <PendingFavoritesSync />

      <div className="flex flex-wrap gap-2 mb-6">
        <TabLink href="/favoritos?view=all" active={view === "all"} label="Todo" count={entries.length} />
        <TabLink href="/favoritos?view=services" active={view === "services"} label="Servicios" count={listingEntries.filter((entry) => entry.listing?.type === "SERVICE").length} />
        <TabLink href="/favoritos?view=products" active={view === "products"} label="Productos" count={listingEntries.filter((entry) => entry.listing?.type === "PRODUCT").length} />
        <TabLink href="/favoritos?view=providers" active={view === "providers"} label="Proveedores" count={providerEntries.length} />
      </div>

      {entries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 p-10 text-center dark:border-zinc-700">
          <p className="text-lg font-semibold text-stone-900 dark:text-stone-100">Todavía no guardaste nada</p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Explorá el marketplace y usá el corazón para armar tu lista.</p>
          <div className="mt-5 flex justify-center">
            <Link href="/buscar">
              <Button className="rounded-xl">Explorar marketplace</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Publicaciones</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">{visibleListings.length} guardadas</p>
            </div>
            {visibleListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {visibleListings.map((entry) => entry.listing && (
                  <MarketplaceCard key={entry.id} listing={entry.listing} favoriteSaved />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-400">
                No hay publicaciones en esta vista.
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Proveedores</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">{visibleProviders.length} guardados</p>
            </div>
            {visibleProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {visibleProviders.map((entry) =>
                  entry.provider ? (
                    <div key={entry.id} className="space-y-2">
                      <ProviderCard provider={entry.provider} />
                      <FavoriteToggleButton
                        type="PROVIDER"
                        targetId={entry.provider.id}
                        initialSaved
                        returnTo="/favoritos?view=providers"
                        compact={false}
                        className="w-full justify-center"
                      />
                    </div>
                  ) : null
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-400">
                No hay proveedores guardados.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
