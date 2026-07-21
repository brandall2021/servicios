import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { PUBLIC_PROVIDER_SELECT, PUBLIC_USER_SELECT } from "@/lib/auth-guard"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/shared/star-rating"
import { ServiceCard } from "@/components/shared/service-card"
import Link from "next/link"
import { MapPin, Shield, Clock, Award, ChevronLeft, MessageSquare, Briefcase, Star } from "lucide-react"
import { auth } from "@/lib/auth"
import { ContactReveal } from "@/components/shared/contact-reveal"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, description: true, zone: true },
  })
  if (!user) return { title: "Proveedor no encontrado" }
  return {
    title: `${user.name} | Servicios`,
    description: user.description?.slice(0, 160) || `Perfil de ${user.name} - ${user.zone || "Proveedor verificad@"}`,
    openGraph: {
      title: user.name,
      description: user.description?.slice(0, 160),
    },
  }
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
          usuario: { select: PUBLIC_PROVIDER_SELECT },
          fotos: { take: 1 },
          opiniones: {
            select: {
              id: true,
              puntuacion: true,
              comentario: true,
              createdAt: true,
              cliente: { select: PUBLIC_USER_SELECT },
              fotos: { select: { id: true, archivo: true, tipo: true } },
            },
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

  const whatsappUrl = provider.whatsapp
    ? `https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, "")}`
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/buscar"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B2A55] to-[#1a3f7a]">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,138,0,0.3),transparent_50%)]" />
            </div>
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar src={provider.image} fallback={provider.name} size="xl" className="ring-4 ring-white/20" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-white">{provider.name}</h1>
                    {provider.verified && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Verificado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <StarRating value={avgRating} size="md" showValue count={allOpiniones.length} readonly />
                    <span className="text-white/40">|</span>
                    <span className="text-white/80 text-sm flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      {provider.trabajosRealizados} trabajos
                    </span>
                  </div>
                  {provider._count.servicios > 0 && (
                    <p className="text-white/50 text-sm mt-1">
                      {provider._count.servicios} servicio{provider._count.servicios !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              {provider.description && (
                <p className="text-white/70 leading-relaxed mt-6 text-sm max-w-2xl">{provider.description}</p>
              )}

              <div className="flex flex-wrap gap-2.5 mt-6">
                {provider.zone && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-white bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {provider.zone}
                  </span>
                )}
                {provider.phone && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-white bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5">
                    <ContactReveal
                      tipo="phone"
                      valor={provider.phone}
                      targetId={provider.id}
                      targetType="proveedor"
                      className="text-white/80 hover:text-white"
                    />
                  </span>
                )}
                {provider.availability && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-white bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {provider.availability}
                  </span>
                )}
              </div>
            </div>
          </div>

          {provider.experience && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/70 dark:border-zinc-700/50 p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Experiencia</h2>
              </div>
              <p className="text-stone-600 dark:text-stone-400 text-sm whitespace-pre-line leading-relaxed">{provider.experience}</p>
            </div>
          )}

          {provider.certifications && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/70 dark:border-zinc-700/50 p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3">Certificaciones</h2>
              <p className="text-stone-600 dark:text-stone-400 text-sm whitespace-pre-line leading-relaxed">{provider.certifications}</p>
            </div>
          )}

          {provider.servicios.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-4">Servicios</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {provider.servicios.map((s, i) => (
                  <ServiceCard key={s.id} servicio={s as never} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-4">
          {session?.user && session.user.id !== provider.id && (
            <div className="space-y-2.5">
              <Link href={`/chat?proveedor=${provider.id}`}>
                <Button className="w-full gap-2 btn-glow rounded-xl">
                  <MessageSquare className="h-4 w-4" />
                  Contactar
                </Button>
              </Link>
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className="w-full gap-2 rounded-xl border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </Button>
                </a>
              )}
              {(provider.website || provider.facebook || provider.instagram) && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/70 dark:border-zinc-700/50 p-4">
                  <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold mb-2">Redes</p>
                  <div className="flex flex-col gap-2">
                    {provider.website && (
                      <ContactReveal tipo="website" valor={provider.website} targetId={provider.id} targetType="proveedor" className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors" />
                    )}
                    {provider.facebook && (
                      <ContactReveal tipo="facebook" valor={provider.facebook} targetId={provider.id} targetType="proveedor" className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors" />
                    )}
                    {provider.instagram && (
                      <ContactReveal tipo="instagram" valor={provider.instagram} targetId={provider.id} targetType="proveedor" className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {allOpiniones.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/70 dark:border-zinc-700/50 p-6">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-500" />
                Calificaciones
              </h3>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone-200/70 dark:border-zinc-700/50">
                <div className="text-3xl font-bold gradient-text-animated">
                  {avgRating.toFixed(1)}
                </div>
                <div>
                  <StarRating value={avgRating} size="sm" readonly />
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{allOpiniones.length} opiniones</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="text-stone-500 dark:text-stone-400 w-6 text-xs">{star}</span>
                    <Star className="h-3 w-3 text-orange-500" />
                    <div className="flex-1 h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            allOpiniones.length > 0
                              ? (ratingDistribution[star - 1] / allOpiniones.length) * 100
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
            </div>
          )}

          {allOpiniones.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/70 dark:border-zinc-700/50 p-6">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-4">Opiniones destacadas</h3>
              <div className="space-y-4">
                {allOpiniones.slice(0, 3).map((opinion) => (
                  <div key={opinion.id} className="pb-4 border-b border-stone-200/70 dark:border-zinc-700/50 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar src={opinion.cliente.image} fallback={opinion.cliente.name} size="sm" />
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{opinion.cliente.name}</span>
                    </div>
                    <StarRating value={opinion.puntuacion} size="sm" readonly />
                    {opinion.comentario && (
                      <p className="text-sm text-stone-600 dark:text-stone-400 mt-1.5 line-clamp-2">{opinion.comentario}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
