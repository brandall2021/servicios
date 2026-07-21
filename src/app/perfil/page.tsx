import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ServiceCard } from "@/components/shared/service-card"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { PlusCircle, MessageSquare, Shield, FileText } from "lucide-react"
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
      <div className="mb-8 animate-fade-in">
        <span className="text-xs font-semibold tracking-widest uppercase gradient-text-animated">
          Cuenta
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-1">
          Mi Perfil
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="animate-fade-in" style={{ animationDelay: "60ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar src={user.image} fallback={user.name} size="xl" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">{user.name}</h2>
                    {user.verified && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Verificado
                      </Badge>
                    )}
                  </div>
                  <Badge variant={isProvider ? "default" : "secondary"} className="mt-1.5">
                    {isProvider ? "Proveedor" : "Cliente"}
                  </Badge>
                  {isProvider && (
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">{user._count.servicios} servicios</p>
                  )}
                </div>
              </div>
              <ProfileForm user={user} />
            </CardContent>
          </Card>

          {isProvider && user.servicios.length > 0 && (
            <section className="animate-fade-in" style={{ animationDelay: "120ms" }}>
              <h2 className="text-sm font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-4">Mis servicios</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {user.servicios.map((s, i) => (
                  <ServiceCard key={s.id} servicio={s} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-3">
          {isProvider && (
            <Link href="/servicios/nuevo">
              <Button className="w-full rounded-xl btn-glow">
                <PlusCircle className="h-4 w-4" />
                Nuevo servicio
              </Button>
            </Link>
          )}
          <Link href="/presupuestos">
            <Button variant="outline" className="w-full rounded-xl">
              <FileText className="h-4 w-4" />
              Mis presupuestos
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline" className="w-full rounded-xl">
              <MessageSquare className="h-4 w-4" />
              Mis mensajes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
