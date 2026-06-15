import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ServiceCard } from "@/components/shared/service-card"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { PlusCircle, MessageSquare, Shield } from "lucide-react"
import { ProfileForm } from "./profile-form"

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: { select: { servicios: true, opiniones: true } },
      servicios: {
        include: {
          usuario: true,
          fotos: { take: 1 },
          opiniones: {
            include: { cliente: true, fotos: true },
            take: 5,
          },
          _count: { select: { opiniones: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) redirect("/login")

  const isProvider = user.role === "PROVIDER"

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar src={user.image} fallback={user.name} size="xl" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-zinc-900">{user.name}</h2>
                    {user.verified && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Verificado
                      </Badge>
                    )}
                  </div>
                  <Badge variant={isProvider ? "default" : "secondary"}>
                    {isProvider ? "Proveedor" : "Cliente"}
                  </Badge>
                  {isProvider && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-zinc-500">{user._count.servicios} servicios</span>
                    </div>
                  )}
                </div>
              </div>
              <ProfileForm user={user} />
            </CardContent>
          </Card>

          {isProvider && user.servicios.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Mis servicios</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.servicios.map((s) => (
                  <ServiceCard key={s.id} servicio={s as never} />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-4">
          {isProvider && (
            <Link href="/servicios/nuevo">
              <Button className="w-full">
                <PlusCircle className="h-4 w-4" />
                Nuevo servicio
              </Button>
            </Link>
          )}
          <Link href="/chat">
            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4" />
              Mis mensajes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
