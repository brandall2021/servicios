"use client"

import ReCAPTCHA from "react-google-recaptcha"

interface RecaptchaProps {
  onChange: (token: string | null) => void
}

export function Recaptcha({ onChange }: RecaptchaProps) {
  const siteKey = typeof window === "undefined" ? null : process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
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
