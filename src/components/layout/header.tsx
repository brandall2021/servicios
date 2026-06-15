"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "../ui/button"
import { Avatar } from "../ui/avatar"
import { Menu, X, PlusCircle, LayoutDashboard, MessageSquare } from "lucide-react"
import { useState } from "react"

export function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-lg text-zinc-900">Servicios</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/buscar" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
              Explorar
            </Link>
            {session?.user ? (
              <>
                {session.user.role === "PROVIDER" && (
                  <Link
                    href="/servicios/nuevo"
                    className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Publicar
                  </Link>
                )}
                <Link
                  href="/chat"
                  className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <Link href="/perfil" className="flex items-center gap-2">
                    <Avatar src={session.user.image} fallback={session.user.name || "U"} size="sm" />
                    <span className="text-sm text-zinc-700">{session.user.name}</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    Salir
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Ingresar</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-zinc-100 pt-4 space-y-3">
            <Link href="/buscar" className="block text-sm text-zinc-600 py-2" onClick={() => setMenuOpen(false)}>
              Explorar
            </Link>
            {session?.user ? (
              <>
                {session.user.role === "PROVIDER" && (
                  <Link href="/servicios/nuevo" className="block text-sm text-zinc-600 py-2" onClick={() => setMenuOpen(false)}>
                    Publicar servicio
                  </Link>
                )}
                <Link href="/chat" className="block text-sm text-zinc-600 py-2" onClick={() => setMenuOpen(false)}>
                  Mensajes
                </Link>
                <Link href="/perfil" className="block text-sm text-zinc-600 py-2" onClick={() => setMenuOpen(false)}>
                  Mi Perfil
                </Link>
                <button onClick={() => signOut()} className="block text-sm text-red-600 py-2">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-sm text-zinc-600 py-2" onClick={() => setMenuOpen(false)}>
                  Ingresar
                </Link>
                <Link href="/register" className="block text-sm text-zinc-600 py-2" onClick={() => setMenuOpen(false)}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
