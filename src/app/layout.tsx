import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

export const dynamic = "force-dynamic"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackToTop } from "@/components/shared/back-to-top"
import { SessionProvider } from "@/components/shared/session-provider"
import { ThemeProvider } from "@/components/shared/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Servicios - Encontrá servicios de confianza",
  description: "Plataforma de publicación y búsqueda de servicios. Conectamos clientes con profesionales verificados.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <ThemeProvider>
          <SessionProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <BackToTop />
            <Footer />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
