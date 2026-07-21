"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    if (!res.ok && data.error) {
      setError(data.error)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="h-14 w-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-2">
              Revisá tu email
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
              Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors">
              Volver a iniciar sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
            Ingresá tu email y te enviaremos un enlace
          </p>
        </div>
        <Card>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "Enviando..." : "Enviar enlace"}
              </Button>
            </form>
            <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
              <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                Volver a iniciar sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
