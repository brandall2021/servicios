import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { NewServiceForm } from "./new-service-form"

export default async function NuevoServicioPage() {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.role !== "PROVIDER") redirect("/")

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Publicar nuevo servicio</h1>
      <NewServiceForm />
    </div>
  )
}
