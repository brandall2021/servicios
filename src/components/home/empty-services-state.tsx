import Link from "next/link"
import { Search, ArrowRight } from "lucide-react"
import { Button } from "../ui/button"

export function EmptyServicesState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-20 px-4">
      <div className="h-14 w-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
        <Search className="h-6 w-6 text-stone-400" />
      </div>
      <h3 className="text-lg font-semibold text-stone-900 mb-1">
        No hay servicios publicados aún
      </h3>
      <p className="text-sm text-stone-500 text-center max-w-sm mb-6">
        Sé el primero en ofrecer tu servicio o explorá nuestras categorías para encontrar lo que buscás.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/buscar">
          <Button variant="outline" className="rounded-xl">
            Explorar categorías
          </Button>
        </Link>
        <Link href="/register">
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">
            Publicar servicio
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
