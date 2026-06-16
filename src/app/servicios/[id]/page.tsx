import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { StarRating } from "@/components/shared/star-rating"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { MapPin, Calendar, Shield, ChevronLeft, MessageSquare, FileText } from "lucide-react"
import { CATEGORIAS } from "@/lib/constants"
import { OpinionForm } from "./opinion-form"
import { ReportButton } from "./report-button"
import { auth } from "@/lib/auth"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ServicioDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const servicio = await prisma.servicio.findUnique({
    where: { id },
    include: {
      usuario: true,
      fotos: true,
      opiniones: {
        include: {
          cliente: true,
          fotos: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { opiniones: true } },
    },
  })

  if (!servicio || !servicio.activo) notFound()

  const catInfo = CATEGORIAS.find((c) => c.value === servicio.categoria)
  const avgRating =
    servicio.opiniones.length > 0
      ? servicio.opiniones.reduce((a, o) => a + o.puntuacion, 0) / servicio.opiniones.length
      : 0

  const ratingDistribution = [0, 0, 0, 0, 0]
  servicio.opiniones.forEach((o) => {
    ratingDistribution[o.puntuacion - 1]++
  })

  const providerOpiniones = await prisma.opinion.count({
    where: { servicio: { usuarioId: servicio.usuarioId } },
  })
  const providerAvg = await prisma.opinion.aggregate({
    where: { servicio: { usuarioId: servicio.usuarioId } },
    _avg: { puntuacion: true },
  })

  const isOwner = session?.user?.id === servicio.usuarioId
  const hasOpinion = session?.user?.id
    ? servicio.opiniones.some((o) => o.clienteId === session.user.id)
    : false

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/buscar"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a resultados
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            {servicio.fotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                {servicio.fotos.map((foto) => (
                  <img
                    key={foto.id}
                    src={foto.archivo}
                    alt=""
                    className="w-full aspect-[4/3] object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full aspect-video bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-300">
                Sin imágenes
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{catInfo?.icon} {catInfo?.label || servicio.categoria}</Badge>
              {servicio.usuario.verified && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Verificado
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
              {servicio.titulo}
            </h1>
            <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
              {avgRating > 0 && (
                <StarRating value={avgRating} size="sm" showValue count={servicio.opiniones.length} readonly />
              )}
              {servicio.ubicacion && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {servicio.ubicacion}
                </span>
              )}
            </div>
            <p className="text-zinc-600 leading-relaxed whitespace-pre-line">
              {servicio.descripcion}
            </p>
          </div>

          {servicio.disponibilidad && (
            <div className="flex items-center gap-2 text-sm text-zinc-600 bg-zinc-50 rounded-lg p-4">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Disponibilidad:</span> {servicio.disponibilidad}
            </div>
          )}

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">
              Opiniones ({servicio.opiniones.length})
            </h2>

            {servicio.opiniones.length > 0 ? (
              <div className="space-y-4">
                {servicio.opiniones.map((opinion) => (
                  <Card key={opinion.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar src={opinion.cliente.image} fallback={opinion.cliente.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-zinc-900">
                              {opinion.cliente.name}
                            </span>
                            <span className="text-xs text-zinc-400">
                              {new Date(opinion.createdAt).toLocaleDateString("es-AR")}
                            </span>
                          </div>
                          <StarRating value={opinion.puntuacion} size="sm" readonly />
                          {opinion.comentario && (
                            <p className="text-sm text-zinc-600 mt-2">{opinion.comentario}</p>
                          )}
                          {opinion.fotos.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {opinion.fotos.map((f) => (
                                <img
                                  key={f.id}
                                  src={f.archivo}
                                  alt=""
                                  className="h-20 w-20 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400 text-center py-8 bg-zinc-50 rounded-xl">
                Aún no hay opiniones. ¡Sé el primero en calificar!
              </p>
            )}

            {session?.user && !isOwner && !hasOpinion && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-zinc-900 mb-4">Dejá tu opinión</h3>
                <OpinionForm servicioId={servicio.id} />
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Link
                href={`/proveedores/${servicio.usuarioId}`}
                className="flex items-center gap-3 mb-4 hover:bg-zinc-50 -m-2 p-2 rounded-lg transition-colors"
              >
                <Avatar src={servicio.usuario.image} fallback={servicio.usuario.name} size="lg" />
                <div>
                  <p className="font-semibold text-zinc-900">{servicio.usuario.name}</p>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <StarRating value={providerAvg._avg.puntuacion || 0} size="sm" readonly />
                    <span>({providerOpiniones})</span>
                  </div>
                </div>
              </Link>

              {servicio.precio && (
                <div className="mb-4">
                  <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Precio</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${servicio.precio.toLocaleString("es-AR")}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {session?.user && session.user.id !== servicio.usuarioId && (
                  <>
                    <Link href={`/presupuestos/solicitar?servicio=${servicio.id}`}>
                      <Button className="w-full rounded-xl" variant="outline">
                        <FileText className="h-4 w-4" />
                        Solicitar presupuesto
                      </Button>
                    </Link>
                    <Link href={`/chat?proveedor=${servicio.usuarioId}&servicio=${servicio.id}`}>
                      <Button className="w-full rounded-xl">
                        <MessageSquare className="h-4 w-4" />
                        Consultar
                      </Button>
                    </Link>
                  </>
                )}
                {!session?.user && (
                  <Link href="/login">
                    <Button className="w-full rounded-xl">Iniciá sesión para consultar</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {servicio.opiniones.length > 0 && (
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
                              servicio.opiniones.length > 0
                                ? (ratingDistribution[star - 1] / servicio.opiniones.length) * 100
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

          <div className="text-center">
            <ReportButton servicioId={servicio.id} proveedorId={servicio.usuarioId} />
          </div>
        </div>
      </div>
    </div>
  )
}
