"use client"

import { useRef, useEffect, useState } from "react"
import ReCAPTCHA from "react-google-recaptcha"

interface RecaptchaProps {
  onChange: (token: string | null) => void
}

export function Recaptcha({ onChange }: RecaptchaProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  if (!siteKey) return null

  return (
    <ReCAPTCHA
      sitekey={siteKey}
      onChange={onChange}
      theme="light"
      size="normal"
    />
  )
}
