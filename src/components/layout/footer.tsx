export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-sm text-zinc-900 mb-3">Plataforma</h3>
            <ul className="space-y-2">
              <li><a href="/buscar" className="text-sm text-zinc-500 hover:text-zinc-700">Explorar servicios</a></li>
              <li><a href="/register" className="text-sm text-zinc-500 hover:text-zinc-700">Ser proveedor</a></li>
              <li><a href="/buscar" className="text-sm text-zinc-500 hover:text-zinc-700">Categorías</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-900 mb-3">Ayuda</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-700">Centro de ayuda</a></li>
              <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-700">Seguridad</a></li>
              <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-700">Términos</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-900 mb-3">Compañía</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-700">Sobre nosotros</a></li>
              <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-700">Blog</a></li>
              <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-700">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-900 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-700">Privacidad</a></li>
              <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-700">Términos de uso</a></li>
              <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-700">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-zinc-200 text-center">
          <p className="text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} Servicios. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
