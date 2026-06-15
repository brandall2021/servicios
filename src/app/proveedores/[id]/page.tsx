import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/shared/star-rating"
import { ServiceCard } from "@/components/shared/service-card"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { MapPin, Shield, Phone, Mail, Clock, Award, ChevronLeft, MessageSquare } from "lucide-react"
import { auth } from "@/lib/auth"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProveedorPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const provider = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { servicios: true, opiniones: true } },
      servicios: {
        where: { activo: true },
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

  if (!provider || provider.role !== "PROVIDER") notFound()

  const allOpiniones = provider.servicios.flatMap((s) => s.opiniones)
  const avgRating =
    allOpiniones.length > 0
      ? allOpiniones.reduce((a, o) => a + o.puntuacion, 0) / allOpiniones.length
      : 0

  const ratingDistribution = [0, 0, 0, 0, 0]
  allOpiniones.forEach((o) => {
    ratingDistribution[o.puntuacion - 1]++
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/buscar"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar src={provider.image} fallback={provider.name} size="xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-zinc-900">{provider.name}</h1>
                    {provider.verified && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Verificado
                      </Badge>
                    )}
                  </div>
                  <StarRating value={avgRating} size="md" showValue count={allOpiniones.length} readonly />
                  <p className="text-sm text-zinc-500 mt-1">
                    {provider._count.servicios} servicios publicados
                  </p>
                </div>
              </div>

              {provider.description && (
                <p className="text-zinc-600 leading-relaxed mt-6">{provider.description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {provider.zone && (
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    {provider.zone}
                  </div>
                )}
                {provider.email && (
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    {provider.email}
                  </div>
                )}
                {provider.phone && (
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Phone className="h-4 w-4 text-zinc-400" />
                    {provider.phone}
                  </div>
                )}
                {provider.availability && (
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    {provider.availability}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {provider.experience && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-zinc-900">Experiencia</h2>
                </div>
                <p className="text-zinc-600 text-sm whitespace-pre-line">{provider.experience}</p>
              </CardContent>
            </Card>
          )}

          {provider.certifications && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-zinc-900 mb-3">Certificaciones</h2>
                <p className="text-zinc-600 text-sm whitespace-pre-line">{provider.certifications}</p>
              </CardContent>
            </Card>
          )}

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">Servicios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {provider.servicios.map((s) => (
                <ServiceCard key={s.id} servicio={s as never} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {session?.user && session.user.id !== provider.id && (
            <Link href={`/chat?proveedor=${provider.id}`}>
              <Button className="w-full">
                <MessageSquare className="h-4 w-4" />
                Contactar
              </Button>
            </Link>
          )}

          {allOpiniones.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-zinc-900 mb-4">Calificaciones</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="text-zinc-500 w-8">{star} ★</span>
                      <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{
                            width: `${
                              allOpiniones.length > 0
                                ? (ratingDistribution[star - 1] / allOpiniones.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-zinc-400 w-6 text-right text-xs">
                        {ratingDistribution[star - 1]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
