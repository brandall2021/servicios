"use client"

import { useState, useCallback } from "react"
import { Eye, EyeOff, Globe, Facebook, Instagram, Phone, ExternalLink } from "lucide-react"
import { registrarContacto } from "@/actions/contacto"

interface ContactRevealProps {
  tipo: "phone" | "whatsapp" | "website" | "facebook" | "instagram"
  valor: string
  targetId: string
  targetType: "proveedor" | "servicio"
  className?: string
}

function defaultIcon(tipo: string) {
  switch (tipo) {
    case "phone": return <Phone className="h-3.5 w-3.5" />
    case "whatsapp": return <Phone className="h-3.5 w-3.5" />
    case "website": return <Globe className="h-3.5 w-3.5" />
    case "facebook": return <Facebook className="h-3.5 w-3.5" />
    case "instagram": return <Instagram className="h-3.5 w-3.5" />
  }
}

function maskPhone(valor: string): string {
  if (valor.length <= 4) return "****"
  return "****" + valor.slice(-4)
}

export function ContactReveal({
  tipo,
  valor,
  targetId,
  targetType,
  className = "",
}: ContactRevealProps) {
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReveal = useCallback(async () => {
    if (revealed || loading) return
    setLoading(true)
    await registrarContacto(tipo, targetId, targetType)
    setRevealed(true)
    setLoading(false)
  }, [revealed, loading, tipo, targetId, targetType])

  if (tipo === "phone" || tipo === "whatsapp") {
    if (revealed) {
      return (
        <span className={`inline-flex items-center gap-1.5 ${className}`}>
          {defaultIcon(tipo)}
          {valor}
        </span>
      )
    }
    return (
      <button
        type="button"
        onClick={handleReveal}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 ${className}`}
      >
        {defaultIcon(tipo)}
        <span className="tracking-widest">{maskPhone(valor)}</span>
        <Eye className="h-3 w-3 opacity-70" />
      </button>
    )
  }

  if (revealed) {
    const href =
      tipo === "website"
        ? valor
        : tipo === "facebook"
          ? valor
          : tipo === "instagram"
            ? valor
            : "#"
    const labels: Record<string, string> = {
      website: "Sitio web",
      facebook: "Facebook",
      instagram: "Instagram",
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-blue-600 hover:underline font-medium ${className}`}
      >
        {defaultIcon(tipo)}
        {labels[tipo] || valor}
        <ExternalLink className="h-3 w-3 opacity-60" />
      </a>
    )
  }

  const btnLabels: Record<string, string> = {
    website: "Ver sitio web",
    facebook: "Ver Facebook",
    instagram: "Ver Instagram",
  }

  return (
    <button
      type="button"
      onClick={handleReveal}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 cursor-pointer ${className}`}
    >
      <EyeOff className="h-3.5 w-3.5" />
      {btnLabels[tipo] || tipo}
    </button>
  )
}
