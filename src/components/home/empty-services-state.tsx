import Link from "next/link"
import { Search, ArrowRight } from "lucide-react"
import { Button } from "../ui/button"

export function EmptyServicesState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-[28px] border border-dashed border-stone-200 bg-stone-50/70 px-4 py-16 sm:py-20 dark:border-zinc-800 dark:bg-zinc-950/30">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-zinc-800">
        <Search className="h-6 w-6 text-stone-400" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-stone-900 dark:text-stone-100">
        No hay publicaciones todavía
      </h3>
      <p className="mb-6 max-w-sm text-center text-sm text-stone-500 dark:text-stone-400">
        Sé el primero en publicar o explorá las categorías para encontrar lo que buscás.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/buscar?type=ALL">
          <Button variant="outline" className="rounded-xl">
            Explorar categorías
          </Button>
        </Link>
        <Link href="/register">
          <Button>
            Publicar
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
