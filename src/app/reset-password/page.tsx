"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, CheckCircle, AlertTriangle } from "lucide-react"

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "Error al restablecer la contraseña")
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md animate-fade-in">
        <CardContent className="p-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-2">
            Contraseña actualizada
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            Tu contraseña se actualizó correctamente
          </p>
          <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors">
            Iniciar sesión
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md animate-fade-in">
        <CardContent className="p-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-2">
            Token inválido
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            El enlace de recuperación no es válido o expiró
          </p>
          <Link href="/forgot-password" className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors">
            Solicitar nuevo enlace
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardContent className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Nueva contraseña
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Ingresá tu nueva contraseña
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="pl-10"
            />
          </div>
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200/70 dark:border-red-800/50 p-3.5 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full btn-glow h-11 rounded-xl" disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-stone-400">Cargando...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  )
}
