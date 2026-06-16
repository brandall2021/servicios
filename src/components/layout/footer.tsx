import Link from "next/link"
import { Sparkles } from "lucide-react"

const footerLinks = [
  {
    title: "Plataforma",
    links: [
      { label: "Explorar servicios", href: "/buscar" },
      { label: "Ser proveedor", href: "/register" },
      { label: "Categorías", href: "/buscar" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Centro de ayuda", href: "#" },
      { label: "Seguridad", href: "#" },
      { label: "Términos y condiciones", href: "#" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { label: "Sobre nosotros", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contacto", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidad", href: "#" },
      { label: "Términos de uso", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-stone-200/60 bg-stone-50/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg overflow-hidden">
                  <img src="/logo.png" alt="Servicios" className="h-full w-full object-cover" />
                </div>
                <span className="font-semibold text-sm text-stone-900 tracking-tight">Servicios</span>
              </Link>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
                La plataforma que conecta clientes con profesionales verificados en Argentina. Encontrá, compará y contratá con confianza.
              </p>
            </div>
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="font-semibold text-xs text-stone-900 uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-stone-500 hover:text-emerald-600 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="py-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <p>&copy; {new Date().getFullYear()} Servicios. Todos los derechos reservados.</p>
          <p>Hecho en Argentina</p>
        </div>
      </div>
    </footer>
  )
}
