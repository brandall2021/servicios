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
    <footer className="mt-auto relative" style={{ backgroundColor: "#0B2A55" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg overflow-hidden">
                  <img src="/logo.png" alt="Servicios" className="h-full w-full object-cover" />
                </div>
                <span className="font-semibold text-sm text-white tracking-tight">Servicios</span>
              </Link>
              <p className="text-xs text-white/60 leading-relaxed max-w-xs">
                La plataforma que conecta clientes con profesionales verificados en Argentina. Encontrá, compará y contratá con confianza.
              </p>
            </div>
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="font-semibold text-xs text-white uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/70 hover:text-[#FFA733] transition-colors duration-200"
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
        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} Servicios. Todos los derechos reservados.</p>
          <p>Hecho en Argentina</p>
        </div>
      </div>
    </footer>
  )
}
