"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Mail, Lock } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const providerMsg = searchParams.get("registered") === "provider"
  const registeredMsg = searchParams.get("registered") === "true"

  useEffect(() => {
    if (providerMsg || registeredMsg) {
      window.history.replaceState({}, "", "/login")
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    })

    if (result?.error) {
      setError("Email o contraseña incorrectos")
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Bienvenido de vuelta
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
            Ingresá a tu cuenta para continuar
          </p>
        </div>

        <Card className="border-stone-200/70 dark:border-zinc-700/50 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.15)]">
          <CardContent className="p-6 sm:p-8">
            {registeredMsg && (
              <div className="mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/70 dark:border-green-800/50 p-3.5 text-sm text-green-700 dark:text-green-400">
                Registro exitoso. Ya podés iniciar sesión.
              </div>
            )}
            {providerMsg && (
              <div className="mb-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/70 dark:border-blue-800/50 p-3.5 text-sm text-blue-700 dark:text-blue-400">
                Tu solicitud para ser proveedor fue enviada. Un administrador la revisará.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-10"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <input type="checkbox" className="rounded border-stone-300 dark:border-zinc-600 text-orange-600 focus:ring-orange-500/30" />
                  Recordarme
                </label>
                <Link href="/forgot-password" className="text-xs text-orange-600 hover:text-orange-700 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200/70 dark:border-red-800/50 p-3.5 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full btn-glow h-11 rounded-xl" disabled={loading}>
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200/70 dark:border-zinc-700/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-900 px-3 text-stone-400 tracking-wider">o continuá con</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-xl"
              onClick={() => signIn("google", { redirectTo: "/" })}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>

            <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
              ¿No tenés cuenta?{" "}
              <Link href="/register" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                Crear cuenta
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
