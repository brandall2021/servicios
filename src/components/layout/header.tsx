"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "../ui/button"
import { Avatar } from "../ui/avatar"
import { Sparkles, PlusCircle, LayoutDashboard, MessageSquare, FileText, Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative z-50 pt-4 sm:pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 bg-white/90 backdrop-blur-xl border border-stone-200/80 rounded-2xl px-4 sm:px-6 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-inner group-hover:shadow-md transition-shadow duration-300">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-base text-stone-900 tracking-tight">Encuentra</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/buscar"
              className="px-3 py-2 text-sm text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100/80 transition-all duration-200"
            >
              Explorar
            </Link>
            {session?.user ? (
              <>
                <Link
                  href="/presupuestos"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100/80 transition-all duration-200"
                >
                  <FileText className="h-4 w-4" />
                  Presupuestos
                </Link>
                {session.user.role === "PROVIDER" && (
                  <Link
                    href="/servicios/nuevo"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100/80 transition-all duration-200"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Publicar
                  </Link>
                )}
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100/80 transition-all duration-200"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/chat"
                  className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100/80 transition-all duration-200"
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-stone-200">
                  <Link href="/perfil" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar src={session.user.image} fallback={session.user.name || "U"} size="sm" />
                    <span className="text-sm font-medium text-stone-700">{session.user.name}</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-stone-500 hover:text-red-600">
                    Salir
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-stone-200">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-stone-600 hover:text-stone-900">
                    Ingresar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-stone-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <X className="h-5 w-5 text-stone-700" /> : <Menu className="h-5 w-5 text-stone-700" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-stone-200/80 rounded-2xl p-4 shadow-lg animate-fade-up">
            <nav className="space-y-1">
              <Link href="/buscar" className="block px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                Explorar servicios
              </Link>
              {session?.user ? (
                <>
                  <Link href="/presupuestos" className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                    <FileText className="h-4 w-4" /> Presupuestos
                  </Link>
                  {session.user.role === "PROVIDER" && (
                    <Link href="/servicios/nuevo" className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                      <PlusCircle className="h-4 w-4" /> Publicar servicio
                    </Link>
                  )}
                  <Link href="/chat" className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                    <MessageSquare className="h-4 w-4" /> Mensajes
                  </Link>
                  <Link href="/perfil" className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                    Mi Perfil
                  </Link>
                  <hr className="my-2 border-stone-100" />
                  <button onClick={() => { signOut(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2 border-stone-100" />
                  <Link href="/login" className="block px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                    Ingresar
                  </Link>
                  <Link href="/register" className="block px-3 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 text-center transition-colors" onClick={() => setMenuOpen(false)}>
                    Registrarse
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
