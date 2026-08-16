"use client"

/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Avatar } from "../ui/avatar"
import {
  MessageSquare, FileText,
  ChevronDown, User, LogOut, Plus,
  Sun, Moon, Shield,
} from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "@/components/shared/theme-provider"
import NotificationBell from "@/components/shared/notification-bell"

export function Header() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function navClass(active: boolean, scrolledStyle = false) {
    return `text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
      active
        ? scrolledStyle
          ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
          : "bg-white/12 text-white"
        : scrolledStyle
          ? "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800"
          : "text-white/72 hover:text-white hover:bg-white/10"
    }`
  }

  const searchType = searchParams.get("type")
  const serviceActive = pathname === "/buscar" && searchType === "SERVICE"
  const productActive = pathname === "/buscar" && searchType === "PRODUCT"
  const howItWorksActive = pathname === "/" && searchParams.get("section") === "como-funciona"
  const accountHref = session?.user ? "/perfil" : "/login"

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-2"
          : "py-3"
      }`}
    >
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 transition-all duration-500 ${
          scrolled
            ? "px-4 sm:px-8"
            : "px-4 sm:px-6"
        }`}
      >
        <div
          className={`flex items-center justify-between h-14 rounded-2xl px-4 sm:px-5 transition-all duration-500 ${
            scrolled
              ? "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.3)] border border-white/50 dark:border-white/5"
              : "bg-[#0B2A55]"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group" aria-label="Servicios, ir al inicio">
            <img
              src={scrolled && theme === "light" ? "/brand/logo-horizontal.svg" : "/brand/logo-horizontal-light.svg"}
              alt="Servicios"
              className="h-9 w-auto max-w-[130px] sm:max-w-[160px] transition-opacity duration-200 group-hover:opacity-90"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/buscar?type=SERVICE"
              className={navClass(serviceActive, scrolled)}
            >
              Servicios
            </Link>
            <Link
              href="/buscar?type=PRODUCT"
              className={navClass(productActive, scrolled)}
            >
              Productos
            </Link>
            <Link
              href="/#como-funciona"
              className={navClass(howItWorksActive, scrolled)}
            >
              Cómo funciona
            </Link>
            <Link href="/favoritos" className={navClass(pathname === "/favoritos", scrolled)}>
              Favoritos
            </Link>
            <Link href={accountHref} className={navClass(pathname === "/perfil" || pathname === "/login", scrolled)}>
              Cuenta
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 ${
                scrolled
                  ? "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {session?.user ? (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/servicios/nuevo"
                  className="h-8 px-3 text-sm font-semibold btn-glow shadow-md inline-flex items-center gap-1.5 active:scale-[0.97]"
                >
                  <Plus className="h-3.5 w-3.5" /> Publicar
                </Link>
              <div className={scrolled ? "" : "[&_button]:text-white/70 [&_button]:hover:text-white"}>
                <NotificationBell />
              </div>
                <Link
                  href="/chat"
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    scrolled
                      ? "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label="Mensajes"
                >
                  <MessageSquare className="h-4.5 w-4.5" />
                </Link>
                <div className="relative group">
                  <button className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 ${
                    scrolled
                      ? "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}>
                    <Avatar src={session.user.image} fallback={session.user.name || "U"} size="sm" />
                    <span className="text-sm font-medium max-w-[100px] truncate">{session.user.name}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </button>
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="glass-card rounded-xl py-2 min-w-[180px] animate-scale-in">
                      <Link href="/perfil" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors">
                        <User className="h-4 w-4" /> Mi perfil
                      </Link>
                      <Link href="/presupuestos" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors">
                        <FileText className="h-4 w-4" /> Presupuestos
                      </Link>
                      <Link href="/chat" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors">
                        <MessageSquare className="h-4 w-4" /> Mensajes
                      </Link>
                      {(session.user.role === "PROVIDER" || session.user.role === "ADMIN") && (
                        <>
                          <Link href="/proveedor/metricas" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors">
                            <Shield className="h-4 w-4 text-orange-500" /> Métricas
                          </Link>
                          <Link href="/proveedor/promociones" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors">
                            <Plus className="h-4 w-4 text-orange-500" /> Promociones
                          </Link>
                        </>
                      )}
                      {session.user.role === "ADMIN" && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors">
                          <Shield className="h-4 w-4 text-orange-500" /> Administración
                        </Link>
                      )}
                      <hr className="my-1 border-stone-100 dark:border-zinc-700" />
                      <button onClick={() => signOut()} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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
                  className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                    scrolled
                      ? "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="btn-glow h-8 px-4 text-sm font-semibold shadow-md active:scale-[0.97]"
                >
                  Crear cuenta
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className={`md:hidden p-2 -mr-1 rounded-lg transition-all duration-200 ${
                scrolled
                  ? "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  menuOpen ? "top-2 rotate-45" : "top-0.5 rotate-0"
                }`} />
                <span className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  menuOpen ? "opacity-0 scale-x-0" : "top-2 opacity-100 scale-x-100"
                }`} />
                <span className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  menuOpen ? "top-2 -rotate-45" : "top-3.5 rotate-0"
                }`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[-1] bg-black/40 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden mx-4 mt-2">
            <div className="glass-card rounded-2xl p-4 space-y-1 animate-scale-in">
            <Link href="/buscar?type=SERVICE" className="block px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
              Servicios
            </Link>
            <Link href="/buscar?type=PRODUCT" className="block px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
              Productos
            </Link>
            <Link href="/#como-funciona" className="block px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
              Cómo funciona
            </Link>
            <Link href="/favoritos" className="block px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
              Favoritos
            </Link>
            {session?.user && (
              <>
                <Link href="/perfil" className="block px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                  Cuenta
                </Link>
                <Link href="/servicios/nuevo" className="block px-3 py-2.5 text-sm font-medium text-white btn-glow text-center rounded-xl" onClick={() => setMenuOpen(false)}>
                  Publicar servicio
                </Link>
              </>
            )}
            <hr className="my-2 border-stone-100 dark:border-zinc-700" />
            {session?.user ? (
              <>
                <Link href="/perfil" className="block px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                  Mi perfil
                </Link>
                <Link href="/presupuestos" className="block px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                  Presupuestos
                </Link>
                <Link href="/chat" className="block px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                  Mensajes
                </Link>
                {(session.user.role === "PROVIDER" || session.user.role === "ADMIN") && (
                  <>
                    <Link href="/proveedor/metricas" className="block px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                      Métricas
                    </Link>
                    <Link href="/proveedor/promociones" className="block px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                      Promociones
                    </Link>
                  </>
                )}
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="block px-3 py-2.5 text-sm text-orange-600 dark:text-orange-400 font-medium rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors" onClick={() => setMenuOpen(false)}>
                    Administración
                  </Link>
                )}
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 text-sm text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                  Iniciar sesión
                </Link>
                <Link href="/register" className="block px-3 py-2.5 text-sm font-medium text-white btn-glow text-center rounded-xl" onClick={() => setMenuOpen(false)}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
          </div>
        </>
      )}
    </header>
  )
}
