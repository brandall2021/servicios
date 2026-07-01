"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ShoppingBag, Store, ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<"CLIENT" | "PROVIDER">("CLIENT")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password,
        phone: formData.get("phone"),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push("/login?registered=true")
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Elegí cómo querés participar
          </p>
        </CardHeader>
        <CardContent>
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("CLIENT")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === "CLIENT"
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
              }`}
            >
              <ShoppingBag className={`h-6 w-6 ${role === "CLIENT" ? "text-orange-600" : "text-zinc-400"}`} />
              <span className={`text-sm font-medium ${role === "CLIENT" ? "text-orange-700 dark:text-orange-400" : "text-zinc-600 dark:text-zinc-400"}`}>
                Quiero comprar
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">o contratar servicios</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("PROVIDER")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === "PROVIDER"
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
              }`}
            >
              <Store className={`h-6 w-6 ${role === "PROVIDER" ? "text-orange-600" : "text-zinc-400"}`} />
              <span className={`text-sm font-medium ${role === "PROVIDER" ? "text-orange-700 dark:text-orange-400" : "text-zinc-600 dark:text-zinc-400"}`}>
                Quiero vender
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">u ofrecer servicios</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              name="name"
              label="Nombre completo"
              placeholder="Juan Pérez"
              required
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="tu@email.com"
              required
            />
            <Input
              id="phone"
              name="phone"
              label="Teléfono"
              placeholder="+54 381 1234567"
            />
            <input type="hidden" name="role" value={role} />
            <Input
              id="password"
              name="password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              required
            />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirmar contraseña"
              placeholder="••••••••"
              required
            />
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando cuenta..." : (
                <span className="flex items-center gap-2">
                  {role === "CLIENT" ? "Crear cuenta como comprador" : "Crear cuenta como vendedor"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {role === "PROVIDER" && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Como vendedor vas a poder publicar servicios, recibir presupuestos y conectar con clientes.
              </p>
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400">O registrate con</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { redirectTo: "/" })}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-orange-600 hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
