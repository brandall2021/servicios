"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Avatar } from "../ui/avatar"
import {
  MessageSquare, FileText,
  Menu, X, ChevronDown, User, LogOut,
  Search, Sun, Moon,
} from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/components/shared/theme-provider"

export function Header() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50" style={{ background: "#0B2A55" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl overflow-hidden ring-2 ring-white/20 group-hover:ring-orange-400/60 transition-all">
              <img src="/logo.png" alt="Servicios" className="h-full w-full object-cover" />
            </div>
            <span className="font-bold text-xl sm:text-2xl text-white tracking-tight">Servicios</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-white/80 hover:text-white font-medium transition-colors">
              Inicio
            </Link>
            <Link href="/buscar" className="text-sm text-white/80 hover:text-white font-medium transition-colors">
              Servicios
            </Link>
            <Link href="/buscar" className="text-sm text-white/80 hover:text-white font-medium transition-colors">
              Profesionales
            </Link>
            <Link href="/buscar" className="text-sm text-white/80 hover:text-white font-medium transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {session?.user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/chat"
                  className="p-2 text-white/70 hover:text-white transition-colors"
                  aria-label="Mensajes"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-2 py-1.5 text-white/80 hover:text-white transition-colors">
                    <Avatar src={session.user.image} fallback={session.user.name || "U"} size="sm" />
                    <span className="text-sm font-medium max-w-[100px] truncate text-white/80">{session.user.name}</span>
                    <ChevronDown className="h-3 w-3 text-white/60" />
                  </button>
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="dark:bg-zinc-800 bg-white rounded-xl shadow-xl border dark:border-zinc-700 border-stone-200 py-2 min-w-[180px]">
                      <Link href="/perfil" className="flex items-center gap-2 px-4 py-2 text-sm dark:text-zinc-300 dark:hover:bg-zinc-700 text-stone-700 hover:bg-stone-50 transition-colors">
                        <User className="h-4 w-4" /> Mi perfil
                      </Link>
                      <Link href="/presupuestos" className="flex items-center gap-2 px-4 py-2 text-sm dark:text-zinc-300 dark:hover:bg-zinc-700 text-stone-700 hover:bg-stone-50 transition-colors">
                        <FileText className="h-4 w-4" /> Presupuestos
                      </Link>
                      <Link href="/chat" className="flex items-center gap-2 px-4 py-2 text-sm dark:text-zinc-300 dark:hover:bg-zinc-700 text-stone-700 hover:bg-stone-50 transition-colors">
                        <MessageSquare className="h-4 w-4" /> Mensajes
                      </Link>
                      <hr className="my-1 dark:border-zinc-700 border-stone-100" />
                      <button onClick={() => signOut()} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <LogOut className="h-4 w-4" /> Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm text-white/80 hover:text-white font-medium transition-colors px-3 py-2"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="btn-orange h-9 px-4 text-sm font-semibold shadow-md"
                >
                  Crear cuenta
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 -mr-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10" style={{ background: "#0B2A55" }}>
          <div className="px-4 py-4 space-y-1">
            <Link href="/" className="block px-3 py-2.5 text-sm text-white/80 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMenuOpen(false)}>
              Inicio
            </Link>
            <Link href="/buscar" className="block px-3 py-2.5 text-sm text-white/80 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMenuOpen(false)}>
              Servicios
            </Link>
            <Link href="/buscar" className="block px-3 py-2.5 text-sm text-white/80 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMenuOpen(false)}>
              Profesionales
            </Link>
            <Link href="/buscar" className="block px-3 py-2.5 text-sm text-white/80 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMenuOpen(false)}>
              Contacto
            </Link>
            <hr className="my-3 border-white/10" />
            {session?.user ? (
              <>
                <Link href="/perfil" className="block px-3 py-2.5 text-sm text-white/80 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMenuOpen(false)}>
                  Mi perfil
                </Link>
                <Link href="/presupuestos" className="block px-3 py-2.5 text-sm text-white/80 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMenuOpen(false)}>
                  Presupuestos
                </Link>
                <Link href="/chat" className="block px-3 py-2.5 text-sm text-white/80 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMenuOpen(false)}>
                  Mensajes
                </Link>
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 text-sm text-red-300 rounded-lg hover:bg-white/10 transition-colors">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2.5 text-sm text-white/80 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMenuOpen(false)}>
                  Iniciar sesión
                </Link>
                <Link href="/register" className="block px-3 py-2.5 text-sm font-medium text-white btn-orange text-center rounded-lg" onClick={() => setMenuOpen(false)}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
