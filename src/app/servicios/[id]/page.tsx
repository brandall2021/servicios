/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { PUBLIC_PROVIDER_SELECT, PUBLIC_USER_SELECT } from "@/lib/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { StarRating } from "@/components/shared/star-rating"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { MapPin, Calendar, Shield, ChevronLeft, MessageSquare, FileText, ArrowUpRight, Clock3, MapPinned } from "lucide-react"
import { CATEGORIAS } from "@/lib/constants"
import { OpinionForm } from "./opinion-form"
import { ReportButton } from "./report-button"
import { auth } from "@/lib/auth"
import { ContactReveal } from "@/components/shared/contact-reveal"
import { ServiceGallery } from "./service-gallery"
import { FavoriteToggleButton } from "@/components/shared/favorite-toggle-button"
import { CompareToggleButton } from "@/components/shared/compare-toggle-button"
import { logCommercialEvent } from "@/lib/commercial-events"
import { CompareTray } from "@/components/shared/compare-tray"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const servicio = await prisma.servicio.findUnique({
    where: { id },
    select: { titulo: true, descripcion: true, categoria: true },
  })
  if (!servicio) return { title: "Servicio no encontrado" }
  return {
    title: `${servicio.titulo} | Servicios`,
    description: servicio.descripcion?.slice(0, 160) || `Encontrá ${servicio.titulo} y más servicios de ${servicio.categoria}`,
    openGraph: {
      title: servicio.titulo,
      description: servicio.descripcion?.slice(0, 160),
    },
  }
}

export default async function ServicioDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const servicio = await prisma.servicio.findUnique({
    where: { id },
    include: {
      usuario: { select: PUBLIC_PROVIDER_SELECT },
      fotos: true,
      opiniones: {
        select: {
          id: true,
          puntuacion: true,
          comentario: true,
          createdAt: true,
          clienteId: true,
          cliente: { select: PUBLIC_USER_SELECT },
          fotos: { select: { id: true, archivo: true, tipo: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { opiniones: true } },
    },
  })

  if (!servicio || !servicio.activo) notFound()

  const favorite = session?.user
    ? await prisma.favorite.findFirst({
        where: { userId: session.user.id, listingId: servicio.id },
      })
    : null

  if (session?.user) {
    await logCommercialEvent({
      type: "LISTING_VIEWED",
      userId: session.user.id,
      sessionId: session.user.id,
      providerId: servicio.usuarioId,
      listingId: servicio.id,
      metadata: { type: "SERVICE" },
    })
  }

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

  const whatsappUrl = servicio.usuario.whatsapp
    ? `https://wa.me/${servicio.usuario.whatsapp.replace(/[^0-9]/g, "")}`
    : null

  const priceText = (servicio.precioTexto || "").trim()
  const priceTextLower = priceText.toLowerCase()
  const priceMode =
    priceTextLower.includes("cotiz")
      ? "A cotizar"
      : priceTextLower.includes("desde")
        ? "Desde"
        : priceTextLower.includes("unidad") || priceTextLower.includes("/u")
          ? "Por unidad"
          : servicio.precio
            ? "Precio fijo"
            : "Consultar"

  const updatedLabel = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
    new Date(servicio.updatedAt)
  )

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 sm:pb-8">
      <Link
        href="/buscar"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a resultados
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="animate-fade-in">
            <ServiceGallery fotos={servicio.fotos} titulo={servicio.titulo} categoria={servicio.categoria} />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "60ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{catInfo?.icon} {catInfo?.label || servicio.categoria}</Badge>
              {servicio.usuario.verified && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Verificado
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-3">
              {servicio.titulo}
            </h1>
            <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400 mb-4">
              {avgRating > 0 && (
                <StarRating value={avgRating} size="sm" showValue count={servicio.opiniones.length} readonly />
              )}
              {servicio.ubicacion && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {servicio.ubicacion}
                </span>
              )}
            </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {servicio.usuario.zone && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                  <MapPinned className="h-3.5 w-3.5" /> {servicio.usuario.zone}
                </span>
              )}
              {servicio.usuario.availability && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                  <Clock3 className="h-3.5 w-3.5" /> {servicio.usuario.availability}
                </span>
              )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                  Actualizado {updatedLabel}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                <FavoriteToggleButton
                  type="LISTING"
                  targetId={servicio.id}
                  initialSaved={Boolean(favorite)}
                  returnTo={`/servicios/${servicio.id}`}
                />
                <CompareToggleButton id={servicio.id} type="SERVICE" providerId={servicio.usuarioId} />
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">
                {servicio.descripcion}
              </p>
          </div>

          {servicio.disponibilidad && (
            <div className="flex items-center gap-2.5 text-sm text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-zinc-800/50 rounded-xl p-4 animate-fade-in" style={{ animationDelay: "120ms" }}>
              <Calendar className="h-4 w-4 text-cyan-600" />
              <span className="font-medium">Disponibilidad:</span> {servicio.disponibilidad}
            </div>
          )}

          <section className="animate-fade-in" style={{ animationDelay: "180ms" }}>
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-6">
              Opiniones ({servicio.opiniones.length})
            </h2>

            {servicio.opiniones.length > 0 ? (
              <div className="space-y-4">
                {servicio.opiniones.map((opinion) => (
                  <Card key={opinion.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <Avatar src={opinion.cliente.image} fallback={opinion.cliente.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-stone-900 dark:text-stone-100">
                              {opinion.cliente.name}
                            </span>
                            <span className="text-xs text-stone-400">
                              {new Date(opinion.createdAt).toLocaleDateString("es-AR")}
                            </span>
                          </div>
                          <StarRating value={opinion.puntuacion} size="sm" readonly />
                          {opinion.comentario && (
                            <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">{opinion.comentario}</p>
                          )}
                          {opinion.fotos.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {opinion.fotos.map((f) => (
                                <img
                                  key={f.id}
                                  src={f.archivo}
                                  alt=""
                                  className="h-20 w-20 object-cover rounded-xl"
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
              <div className="text-center py-12 bg-stone-50 dark:bg-zinc-800/30 rounded-2xl">
                <p className="text-stone-400 dark:text-stone-500">
                  Aún no hay opiniones. Sé el primero en calificar.
                </p>
              </div>
            )}

            {session?.user && !isOwner && !hasOpinion && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">Dejá tu opinión</h3>
                <OpinionForm servicioId={servicio.id} />
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <Link
                href={`/proveedores/${servicio.usuarioId}`}
                className="flex items-center gap-3 mb-5 -m-2 p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <Avatar src={servicio.usuario.image} fallback={servicio.usuario.name} size="lg" />
                <div>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">{servicio.usuario.name}</p>
                  <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                    <StarRating value={providerAvg._avg.puntuacion || 0} size="sm" readonly />
                    <span>({providerOpiniones})</span>
                  </div>
                </div>
              </Link>

              {servicio.precio && (
                <div className="mb-5 pb-5 border-b border-stone-200/70 dark:border-zinc-700/50">
                  <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold mb-1">Precio</p>
                  <p className="text-2xl font-bold gradient-text-animated">
                    ${servicio.precio.toLocaleString("es-AR")}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{priceMode}</p>
                </div>
              )}

              {priceText && (
                <div className="mb-5 pb-5 border-b border-stone-200/70 dark:border-zinc-700/50">
                  <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold mb-1">Condición</p>
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{priceText}</p>
                </div>
              )}

              <div className="mb-5 pb-5 border-b border-stone-200/70 dark:border-zinc-700/50">
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold mb-2">Cobertura</p>
                <div className="flex flex-wrap gap-2">
                  {servicio.ubicacion && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
                      <MapPin className="h-3.5 w-3.5" /> {servicio.ubicacion}
                    </span>
                  )}
                  {servicio.usuario.zone && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
                      <MapPinned className="h-3.5 w-3.5" /> {servicio.usuario.zone}
                    </span>
                  )}
                </div>
              </div>

              {(servicio.website || servicio.facebook || servicio.instagram) && (
                <div className="mb-5 pb-5 border-b border-stone-200/70 dark:border-zinc-700/50">
                  <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold mb-2">Redes</p>
                  <div className="flex flex-col gap-2">
                    {servicio.website && (
                      <ContactReveal
                        tipo="website"
                        valor={servicio.website}
                        targetId={servicio.id}
                        targetType="servicio"
                        className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                      />
                    )}
                    {servicio.facebook && (
                      <ContactReveal
                        tipo="facebook"
                        valor={servicio.facebook}
                        targetId={servicio.id}
                        targetType="servicio"
                        className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                      />
                    )}
                    {servicio.instagram && (
                      <ContactReveal
                        tipo="instagram"
                        valor={servicio.instagram}
                        targetId={servicio.id}
                        targetType="servicio"
                        className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                {session?.user && session.user.id !== servicio.usuarioId && (
                  <>
                    <Link href={`/presupuestos/solicitar?servicio=${servicio.id}`}>
                      <Button className="w-full rounded-xl" variant="outline">
                        <FileText className="h-4 w-4" />
                        Solicitar presupuesto
                      </Button>
                    </Link>
                    <Link href={`/chat?proveedor=${servicio.usuarioId}&servicio=${servicio.id}`}>
                      <Button className="w-full rounded-xl btn-glow">
                        <MessageSquare className="h-4 w-4" />
                        Consultar
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
                      </Button>
                    </Link>
                  </>
                )}
                {!session?.user && (
                  <Link href="/login">
                    <Button className="w-full rounded-xl btn-glow">Iniciá sesión para consultar</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {servicio.opiniones.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-4">Calificaciones</h3>
                <div className="space-y-2.5">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="text-stone-500 dark:text-stone-400 w-8">{star} ★</span>
                      <div className="flex-1 h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              servicio.opiniones.length > 0
                                ? (ratingDistribution[star - 1] / servicio.opiniones.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-stone-400 dark:text-stone-500 w-6 text-right text-xs">
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

      {session?.user && session.user.id !== servicio.usuarioId && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <div className="rounded-2xl border border-stone-200/80 dark:border-zinc-700/60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.14)] p-3 grid grid-cols-3 gap-2">
            <Link href={`/chat?proveedor=${servicio.usuarioId}&servicio=${servicio.id}`}>
              <Button className="w-full rounded-xl btn-glow h-11 px-2 text-xs">
                <MessageSquare className="h-4 w-4" />
                Consultar
              </Button>
            </Link>
            <Link href={`/presupuestos/solicitar?servicio=${servicio.id}`}>
              <Button className="w-full rounded-xl h-11 px-2 text-xs" variant="outline">
                <FileText className="h-4 w-4" />
                Presupuesto
              </Button>
            </Link>
            {whatsappUrl ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full rounded-xl h-11 px-2 text-xs" variant="outline">
                  WhatsApp
                </Button>
              </a>
            ) : (
              <Link href={`/proveedores/${servicio.usuarioId}`}>
                <Button className="w-full rounded-xl h-11 px-2 text-xs" variant="outline">
                  Perfil
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
    <CompareTray />
    </>
  )
}
