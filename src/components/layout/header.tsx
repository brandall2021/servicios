"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Avatar } from "../ui/avatar"
import {
  PlusCircle, LayoutDashboard, MessageSquare, FileText,
  Menu, X, Search, MapPin, ChevronDown, User, LogOut,
  Briefcase,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CATEGORIAS } from "@/lib/constants"

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    router.push(`/buscar?${params.toString()}`)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="hidden md:flex h-8 bg-emerald-900 text-white/70 text-xs">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="hover:text-white transition-colors cursor-pointer">Ingresá tu ubicación</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/buscar" className="hover:text-white transition-colors">Categorías</Link>
            {session?.user?.role === "PROVIDER" ? (
              <Link href="/servicios/nuevo" className="hover:text-white transition-colors">Publicar servicio</Link>
            ) : (
              <Link href="/register?role=PROVIDER" className="hover:text-white transition-colors">Ser proveedor</Link>
            )}
            <Link href="/buscar" className="hover:text-white transition-colors">Ayuda</Link>
            {session?.user && (
              <>
                <span className="text-white/30">|</span>
                <Link href="/presupuestos" className="hover:text-white transition-colors">Mis presupuestos</Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-emerald-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4 h-14 sm:h-16">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-emerald-500/50 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="h-8 w-8 rounded-lg overflow-hidden ring-2 ring-white/30 group-hover:ring-white/60 transition-all">
                <img src="/logo.png" alt="Servicios" className="h-full w-full object-cover" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight hidden sm:block">Servicios</span>
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-emerald-300 transition-shadow">
                <input
                  type="text"
                  placeholder="Buscá servicios, profesionales, categorías..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-9 sm:h-10 px-3 sm:px-4 text-sm text-stone-900 placeholder:text-stone-400 outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="h-9 sm:h-10 px-3 sm:px-5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors flex items-center justify-center"
                  aria-label="Buscar"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* User actions */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {session?.user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/chat"
                    className="p-2 text-white/80 hover:text-white hover:bg-emerald-500/50 rounded-lg transition-all"
                    aria-label="Mensajes"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-2 py-1.5 text-white/80 hover:text-white hover:bg-emerald-500/50 rounded-lg transition-all">
                      <Avatar src={session.user.image} fallback={session.user.name || "U"} size="sm" />
                      <span className="text-sm font-medium max-w-[100px] truncate">{session.user.name}</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-white rounded-lg shadow-xl border border-stone-200 py-2 min-w-[180px]">
                        <Link href="/perfil" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                          <User className="h-4 w-4" /> Mi perfil
                        </Link>
                        <Link href="/presupuestos" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                          <FileText className="h-4 w-4" /> Presupuestos
                        </Link>
                        <Link href="/chat" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                          <MessageSquare className="h-4 w-4" /> Mensajes
                        </Link>
                        {session.user.role === "PROVIDER" && (
                          <Link href="/servicios/nuevo" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                            <PlusCircle className="h-4 w-4" /> Publicar servicio
                          </Link>
                        )}
                        {session.user.role === "ADMIN" && (
                          <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                            <LayoutDashboard className="h-4 w-4" /> Admin
                          </Link>
                        )}
                        <hr className="my-1 border-stone-100" />
                        <button onClick={() => signOut()} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut className="h-4 w-4" /> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link href="/login">
                    <button className="h-8 px-3 text-sm text-white/90 hover:text-white font-medium hover:bg-emerald-500/50 rounded-lg transition-all">
                      Ingresar
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="h-8 px-4 text-sm font-semibold text-emerald-700 bg-white hover:bg-emerald-50 rounded-lg transition-all shadow-sm">
                      Registrarse
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <div className="hidden md:block bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 h-10 overflow-x-auto">
            <Link
              href="/buscar"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <Briefcase className="h-3.5 w-3.5" /> Todas las categorías
            </Link>
            <span className="text-stone-300">|</span>
            {CATEGORIAS.slice(0, 8).map((cat) => (
              <Link
                key={cat.value}
                href={`/buscar?categoria=${cat.value}`}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
              >
                {cat.label}
              </Link>
            ))}
            <Link
              href="/buscar"
              className="px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
            >
              Ver más &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 shadow-lg max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {/* Search on mobile */}
            <form onSubmit={handleSearch} className="mb-3">
              <div className="flex items-center bg-stone-100 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-400">
                <input
                  type="text"
                  placeholder="Buscá servicios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-10 px-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none bg-transparent"
                />
                <button type="submit" className="h-10 px-3 text-emerald-600" aria-label="Buscar">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-1 mb-3">
              {CATEGORIAS.slice(0, 6).map((cat) => (
                <Link
                  key={cat.value}
                  href={`/buscar?categoria=${cat.value}`}
                  className="px-3 py-2 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
              <Link
                href="/buscar"
                className="px-3 py-2 text-sm font-medium text-emerald-600 rounded-lg hover:bg-stone-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Ver todas &rarr;
              </Link>
            </div>

            <hr className="border-stone-100" />

            {session?.user ? (
              <>
                <Link href="/perfil" className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                  <User className="h-4 w-4" /> Mi perfil
                </Link>
                <Link href="/presupuestos" className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                  <FileText className="h-4 w-4" /> Presupuestos
                </Link>
                <Link href="/chat" className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                  <MessageSquare className="h-4 w-4" /> Mensajes
                </Link>
                {session.user.role === "PROVIDER" && (
                  <Link href="/servicios/nuevo" className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                    <PlusCircle className="h-4 w-4" /> Publicar servicio
                  </Link>
                )}
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" /> Admin
                  </Link>
                )}
                <hr className="my-2 border-stone-100" />
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                  <User className="h-4 w-4" /> Ingresar
                </Link>
                <Link href="/register" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 text-center justify-center transition-colors" onClick={() => setMenuOpen(false)}>
                  Crear cuenta
                </Link>
                <Link href="/register?role=PROVIDER" className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 rounded-lg hover:bg-stone-100 transition-colors" onClick={() => setMenuOpen(false)}>
                  <Briefcase className="h-4 w-4" /> Ser proveedor
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
