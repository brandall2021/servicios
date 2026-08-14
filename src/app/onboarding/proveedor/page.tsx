import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProviderOnboardingForm } from "./provider-onboarding-form"
import Link from "next/link"

export default async function ProveedorOnboardingPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      rubro: true,
      zone: true,
      availability: true,
      whatsapp: true,
      documentacion: true,
      solicitudProveedor: true,
    },
  })

  if (!user) redirect("/login")

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase gradient-text-animated">Onboarding</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-1">
          Perfil de proveedor
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
          Completá tu rubro, zona y documentación en pasos guardables.
        </p>
      </div>

      <ProviderOnboardingForm user={user} />

      <div className="mt-4 text-sm text-stone-500 dark:text-stone-400">
        <Link href="/perfil" className="text-orange-600 hover:text-orange-700 font-medium">
          Volver al perfil
        </Link>
      </div>
    </div>
  )
}
