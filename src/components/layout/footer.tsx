/* eslint-disable @next/next/no-img-element */
import Link from "next/link"

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
      { label: "Centro de ayuda", href: "/buscar" },
      { label: "Seguridad", href: "/buscar" },
      { label: "Términos y condiciones", href: "/buscar" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { label: "Sobre nosotros", href: "/buscar" },
      { label: "Blog", href: "/buscar" },
      { label: "Contacto", href: "/buscar" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidad", href: "/buscar" },
      { label: "Términos de uso", href: "/buscar" },
      { label: "Cookies", href: "/buscar" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-auto relative overflow-hidden" style={{ backgroundColor: "#0B2A55" }}>
      <div className="absolute inset-0 dot-pattern opacity-10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-14 sm:py-18">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center mb-4 group" aria-label="Servicios, ir al inicio">
                <img src="/brand/logo-horizontal-light.svg" alt="Servicios" className="h-8 w-auto max-w-[110px] transition-opacity duration-200 group-hover:opacity-90" />
              </Link>
              <p className="text-xs text-white/50 leading-relaxed max-w-xs">
                La plataforma que conecta clientes con profesionales de confianza en Argentina. Encontrá, compará y contratá con confianza.
              </p>
            </div>
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="font-semibold text-[11px] text-white/40 uppercase tracking-widest mb-4">
                  {group.title}
                </h3>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 hover:text-orange-300 transition-colors duration-300"
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
        <div className="py-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} Servicios. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            Hecho en
            <span className="text-orange-400/80 font-medium">Argentina</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
