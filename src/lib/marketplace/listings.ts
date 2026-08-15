import { Prisma, ListingType, ListingStatus, PriceType } from "@prisma/client"
import { CATEGORIAS } from "@/lib/constants"

export type MarketplaceSort = "relevance" | "newest" | "price_asc" | "price_desc" | "rating"

export interface MarketplaceFilters {
  type: ListingType | "ALL"
  q: string
  category: string
  province: string
  city: string
  minPrice: number | null
  maxPrice: number | null
  priceType: PriceType | "ALL"
  verified: boolean | null
  sort: MarketplaceSort
  cursor: string | null
  limit: number
}

export interface MarketplaceListingDTO {
  id: string
  type: ListingType
  status: ListingStatus | "ACTIVE"
  slug: string
  title: string
  description: string
  category: {
    id: string
    type: ListingType
    slug: string
    name: string
    icon: string | null
  }
  provider: {
    id: string
    name: string
    image: string | null
    verified: boolean
    zone: string | null
    trabajosRealizados: number
    whatsapp: string | null
    website: string | null
    facebook: string | null
    instagram: string | null
    kind: string | null
    tradeName: string | null
    verificationStatus: string | null
    responseTimeMinutes: number | null
  }
  featured: boolean
  priceType: PriceType
  price: number | null
  currency: string
  priceUnit: string | null
  locationText: string | null
  province: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  ratingAverage: number
  ratingCount: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  media: Array<{
    id: string
    archivo: string
    mimeType: string | null
    size: number | null
    sortOrder: number
  }>
  service?: {
    modality: string | null
    coverageRadiusKm: number | null
    durationText: string | null
    availabilityText: string | null
    includesText: string | null
    excludesText: string | null
  }
  product?: {
    sku: string | null
    brand: string | null
    unit: string | null
    stockQuantity: number | null
    trackStock: boolean
    minimumOrder: number | null
    fulfillment: "PICKUP" | "DELIVERY" | "BOTH"
    deliveryText: string | null
  }
}

export interface LegacyServiceRow {
  id: string
  titulo: string
  descripcion: string
  categoria: string
  precio: number | null
  precioTexto: string | null
  ubicacion: string | null
  lat: number | null
  lng: number | null
  disponibilidad: string | null
  website: string | null
  facebook: string | null
  instagram: string | null
  activo: boolean
  createdAt: Date
  updatedAt: Date
  usuario: {
    id: string
    name: string
    image: string | null
    verified: boolean
    zone: string | null
    trabajosRealizados: number
    whatsapp: string | null
    website: string | null
    facebook: string | null
    instagram: string | null
    description: string | null
    experience: string | null
    certifications: string | null
    availability: string | null
    rubro: string | null
    providerProfile?: {
      kind: string
      tradeName: string
      verificationStatus: string
      responseTimeMinutes: number | null
      province: string | null
      city: string | null
    } | null
  }
  fotos: Array<{ id: string; archivo: string; tipo: string }>
  opiniones: Array<{ puntuacion: number }>
  _count: { opiniones: number }
}

export interface MarketplaceListingRow {
  id: string
  type: ListingType
  status: ListingStatus
  title: string
  slug: string
  description: string
  featured: boolean
  priceType: PriceType
  price: Prisma.Decimal | null
  currency: string
  priceUnit: string | null
  locationText: string | null
  latitude: Prisma.Decimal | null
  longitude: Prisma.Decimal | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    type: ListingType
    name: string
    slug: string
    icon: string | null
  }
  provider: {
    id: string
    name: string
    image: string | null
    verified: boolean
    zone: string | null
    trabajosRealizados: number
    whatsapp: string | null
    website: string | null
    facebook: string | null
    instagram: string | null
    rubro: string | null
  }
  providerProfile: {
    kind: string
    tradeName: string
    verificationStatus: string
    responseTimeMinutes: number | null
    province: string | null
    city: string | null
  } | null
  media: Array<{
    id: string
    archivo: string
    mimeType: string | null
    size: number | null
    sortOrder: number
  }>
  service: {
    modality: string | null
    coverageRadiusKm: number | null
    durationText: string | null
    availabilityText: string | null
    includesText: string | null
    excludesText: string | null
  } | null
  product: {
    sku: string | null
    brand: string | null
    unit: string | null
    stockQuantity: Prisma.Decimal | null
    trackStock: boolean
    minimumOrder: Prisma.Decimal | null
    fulfillment: "PICKUP" | "DELIVERY" | "BOTH"
    deliveryText: string | null
  } | null
}

export function slugifyListing(title: string, id: string) {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return `${base || "listing"}-${id.slice(0, 8)}`
}

export function serviceCategoryMeta(categoria: string) {
  const cat = CATEGORIAS.find((item) => item.value === categoria)
  return {
    id: categoria,
    type: "SERVICE" as const,
    slug: categoria,
    name: cat?.label || categoria,
    icon: cat?.icon || null,
  }
}

export function serializeNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) return null
  if (typeof value === "number") return value
  return value.toNumber()
}

export function deriveLegacyPriceType(precio: number | null, precioTexto: string | null): PriceType {
  const text = (precioTexto || "").toLowerCase()
  if (text.includes("cotiz")) return PriceType.QUOTE
  if (text.includes("desde")) return PriceType.FROM
  if (text.includes("unidad") || text.includes("/u")) return PriceType.PER_UNIT
  return precio !== null ? PriceType.FIXED : PriceType.QUOTE
}

export function legacyServiceToListing(row: LegacyServiceRow): MarketplaceListingDTO {
  const priceType = deriveLegacyPriceType(row.precio, row.precioTexto)
  const providerProfile = row.usuario.providerProfile || null

  return {
    id: row.id,
    type: ListingType.SERVICE,
    status: row.activo ? "PUBLISHED" : "PAUSED",
    slug: slugifyListing(row.titulo, row.id),
    title: row.titulo,
    description: row.descripcion,
    category: serviceCategoryMeta(row.categoria),
    provider: {
      id: row.usuario.id,
      name: row.usuario.name,
      image: row.usuario.image,
      verified: providerProfile?.verificationStatus === "VERIFIED" || row.usuario.verified,
      zone: providerProfile?.city || row.usuario.zone,
      trabajosRealizados: row.usuario.trabajosRealizados,
      whatsapp: row.usuario.whatsapp,
      website: row.usuario.website,
      facebook: row.usuario.facebook,
      instagram: row.usuario.instagram,
      kind: providerProfile?.kind || null,
      tradeName: providerProfile?.tradeName || null,
      verificationStatus: providerProfile?.verificationStatus || null,
      responseTimeMinutes: providerProfile?.responseTimeMinutes ?? null,
    },
    featured: false,
    priceType,
    price: row.precio,
    currency: "ARS",
    priceUnit: row.precioTexto,
    locationText: row.ubicacion,
    province: providerProfile?.province || null,
    city: providerProfile?.city || row.usuario.zone,
    latitude: row.lat,
    longitude: row.lng,
    ratingAverage: row.opiniones.length > 0
      ? row.opiniones.reduce((sum, opinion) => sum + opinion.puntuacion, 0) / row.opiniones.length
      : 0,
    ratingCount: row._count.opiniones,
    publishedAt: row.activo ? row.createdAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    media: row.fotos.map((foto, index) => ({
      id: foto.id,
      archivo: foto.archivo,
      mimeType: foto.tipo || null,
      size: null,
      sortOrder: index,
    })),
    service: {
      modality: null,
      coverageRadiusKm: null,
      durationText: null,
      availabilityText: row.disponibilidad,
      includesText: null,
      excludesText: null,
    },
    product: undefined,
  }
}

export function listingRowToListing(row: MarketplaceListingRow): MarketplaceListingDTO {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: {
      id: row.category.id,
      type: row.category.type,
      slug: row.category.slug,
      name: row.category.name,
      icon: row.category.icon,
    },
    provider: {
      id: row.provider.id,
      name: row.provider.name,
      image: row.provider.image,
      verified: row.providerProfile?.verificationStatus === "VERIFIED" || row.provider.verified,
      zone: row.providerProfile?.city || row.provider.zone,
      trabajosRealizados: row.provider.trabajosRealizados,
      whatsapp: row.provider.whatsapp,
      website: row.provider.website,
      facebook: row.provider.facebook,
      instagram: row.provider.instagram,
      kind: row.providerProfile?.kind || null,
      tradeName: row.providerProfile?.tradeName || null,
      verificationStatus: row.providerProfile?.verificationStatus || null,
      responseTimeMinutes: row.providerProfile?.responseTimeMinutes ?? null,
    },
    featured: row.featured,
    priceType: row.priceType,
    price: serializeNumber(row.price),
    currency: row.currency,
    priceUnit: row.priceUnit,
    locationText: row.locationText,
    province: row.providerProfile?.province || null,
    city: row.providerProfile?.city || row.provider.zone,
    latitude: serializeNumber(row.latitude),
    longitude: serializeNumber(row.longitude),
    ratingAverage: 0,
    ratingCount: 0,
    publishedAt: row.publishedAt?.toISOString() || null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    media: row.media.map((media) => ({
      id: media.id,
      archivo: media.archivo,
      mimeType: media.mimeType,
      size: media.size ?? null,
      sortOrder: media.sortOrder,
    })),
    service: row.service
      ? {
          modality: row.service.modality,
          coverageRadiusKm: row.service.coverageRadiusKm ?? null,
          durationText: row.service.durationText,
          availabilityText: row.service.availabilityText,
          includesText: row.service.includesText,
          excludesText: row.service.excludesText,
        }
      : undefined,
    product: row.product
      ? {
          sku: row.product.sku,
          brand: row.product.brand,
          unit: row.product.unit,
          stockQuantity: serializeNumber(row.product.stockQuantity),
          trackStock: row.product.trackStock,
          minimumOrder: serializeNumber(row.product.minimumOrder),
          fulfillment: row.product.fulfillment,
          deliveryText: row.product.deliveryText,
        }
      : undefined,
  }
}
