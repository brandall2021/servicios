"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { PROVINCIAS_ARGENTINA } from "@/lib/constants"
import { Check, Save, ArrowRight } from "lucide-react"

type User = {
  id: string
  name: string
  email: string
  rubro: string | null
  zone: string | null
  availability: string | null
  whatsapp: string | null
  documentacion: string | null
  solicitudProveedor: boolean
}

type FormState = {
  rubro: string
  zone: string
  availability: string
  whatsapp: string
  documentacion: string
}

const EMPTY_FORM: FormState = {
  rubro: "",
  zone: "",
  availability: "",
  whatsapp: "",
  documentacion: "",
}

export function ProviderOnboardingForm({ user }: { user: User }) {
  const storageKey = useMemo(() => `servicios:onboarding:provider:${user.id}`, [user.id])
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) {
      setForm({
        rubro: user.rubro || "",
        zone: user.zone || "",
        availability: user.availability || "",
        whatsapp: user.whatsapp || "",
        documentacion: user.documentacion || "",
      })
      return
    }
    try {
      const parsed = JSON.parse(saved) as Partial<FormState>
      setForm({
        rubro: parsed.rubro ?? user.rubro ?? "",
        zone: parsed.zone ?? user.zone ?? "",
        availability: parsed.availability ?? user.availability ?? "",
        whatsapp: parsed.whatsapp ?? user.whatsapp ?? "",
        documentacion: parsed.documentacion ?? user.documentacion ?? "",
      })
    } catch {
      setForm({
        rubro: user.rubro || "",
        zone: user.zone || "",
        availability: user.availability || "",
        whatsapp: user.whatsapp || "",
        documentacion: user.documentacion || "",
      })
    }
  }, [storageKey, user.availability, user.documentacion, user.id, user.rubro, user.whatsapp, user.zone])

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(form))
  }, [form, storageKey])

  async function savePartial(partial: Record<string, string | null>) {
    const res = await fetch("/api/usuarios/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || "No se pudo guardar")
    }
  }

  async function nextStep() {
    setSaving(true)
    setMessage("")
    try {
      if (step === 1) {
        await savePartial({ rubro: form.rubro.trim() || null })
        setStep(2)
      } else if (step === 2) {
        await savePartial({
          zone: form.zone.trim() || null,
          availability: form.availability.trim() || null,
          whatsapp: form.whatsapp.trim() || null,
        })
        setStep(3)
      } else {
        await savePartial({ documentacion: form.documentacion.trim() || null })
        setMessage("Guardado. Un administrador revisará tu solicitud cuando termines de completar los datos.")
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-stone-200/70 dark:border-zinc-700/50 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-400">
          <span className={step >= 1 ? "text-orange-600" : ""}>01 Rubro</span>
          <span>•</span>
          <span className={step >= 2 ? "text-orange-600" : ""}>02 Zona</span>
          <span>•</span>
          <span className={step >= 3 ? "text-orange-600" : ""}>03 Documentación</span>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Paso 1: tu rubro</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Contá a qué te dedicás para que te encuentren mejor.</p>
            </div>
            <Input
              id="rubro"
              name="rubro"
              label="Rubro"
              value={form.rubro}
              onChange={(e) => setForm((p) => ({ ...p, rubro: e.target.value }))}
              placeholder="Ej: Electricista, albañil, pintor"
              autoComplete="organization-title"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Paso 2: zona y contacto</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Guardamos dónde trabajás y cómo responder rápido.</p>
            </div>
            <Select
              id="zone"
              name="zone"
              label="Zona de trabajo"
              options={PROVINCIAS_ARGENTINA.map((p) => ({ value: p, label: p }))}
              placeholder="Seleccionar provincia"
              value={form.zone}
              onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))}
            />
            <Input
              id="availability"
              name="availability"
              label="Disponibilidad"
              value={form.availability}
              onChange={(e) => setForm((p) => ({ ...p, availability: e.target.value }))}
              placeholder="Ej: Lunes a viernes 9-18hs"
            />
            <Input
              id="whatsapp"
              name="whatsapp"
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
              placeholder="Ej: +54 11 2345-6789"
              autoComplete="tel"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Paso 3: documentación</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Dejá datos, enlaces o referencias para revisión.</p>
            </div>
            <Textarea
              id="documentacion"
              name="documentacion"
              label="Documentación"
              rows={6}
              value={form.documentacion}
              onChange={(e) => setForm((p) => ({ ...p, documentacion: e.target.value }))}
              placeholder="CUIT, matrícula, links, referencias, papeles o notas importantes"
            />
            <div className="rounded-2xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/70 dark:border-zinc-700/50 p-4 text-sm text-stone-600 dark:text-stone-300">
              <p className="font-medium text-stone-900 dark:text-stone-100 mb-1">Solicitud pendiente</p>
              <p>Tu cuenta queda en revisión hasta que un administrador la apruebe como proveedor.</p>
            </div>
          </div>
        )}

        {message && (
          <div className={`rounded-xl p-3 text-sm ${message.includes("revisará") ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
            {message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-xs text-stone-400">
            Podés guardar ahora y volver después. El progreso queda en este navegador.
          </p>
          <Button onClick={nextStep} disabled={saving} className="rounded-xl gap-2">
            {saving ? "Guardando..." : step === 3 ? "Guardar solicitud" : "Guardar y seguir"}
            {step === 3 ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
