import { PrismaClient, ListingStatus, ListingType, PriceType, FulfillmentType, InquiryStatus, BookingStatus } from "@prisma/client"
import { Prisma } from "@prisma/client"

const prisma = new PrismaClient()

const placeholderSvg = (label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#fff7ed"/><stop offset="100%" stop-color="#e7e5e4"/></linearGradient></defs><rect width="1200" height="900" fill="url(#g)"/><text x="60" y="120" fill="#c2410c" font-family="Arial, sans-serif" font-size="56" font-weight="700">${label}</text></svg>`)}`

export interface VisualFixtures {
  service: { id: string; slug: string }
  product: { id: string; slug: string }
  bookingId: string
  inquiryId: string
  clientEmail: string
  providerEmail: string
  adminEmail: string
}

export async function ensureVisualFixtures(): Promise<VisualFixtures> {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } })
  const provider = await prisma.user.findFirst({ where: { role: "PROVIDER" }, orderBy: { createdAt: "asc" } })
  const client = await prisma.user.findFirst({ where: { role: "CLIENT" }, orderBy: { createdAt: "asc" } })

  if (!admin || !provider || !client) {
    throw new Error("Faltan usuarios seed para Playwright")
  }

  const serviceCategory = await prisma.category.upsert({
    where: { type_slug: { type: ListingType.SERVICE, slug: "servicios-demo" } },
    update: { active: true, name: "Servicios demo" },
    create: { type: ListingType.SERVICE, slug: "servicios-demo", name: "Servicios demo", icon: "🛠️", active: true, sortOrder: 999 },
  })

  const productCategory = await prisma.category.upsert({
    where: { type_slug: { type: ListingType.PRODUCT, slug: "productos-demo" } },
    update: { active: true, name: "Productos demo" },
    create: { type: ListingType.PRODUCT, slug: "productos-demo", name: "Productos demo", icon: "📦", active: true, sortOrder: 999 },
  })

  const service = await prisma.listing.upsert({
    where: { slug: "playwright-service-demo" },
    update: {
      status: ListingStatus.PUBLISHED,
      featured: true,
      priceType: PriceType.FROM,
      price: new Prisma.Decimal(12000),
      priceUnit: null,
      media: { deleteMany: {}, create: [{ archivo: placeholderSvg("Servicio demo"), mimeType: "image/svg+xml", size: null, sortOrder: 0 }] },
      service: { upsert: { create: { modality: "Presencial", availabilityText: "Lun a vie 9:00 - 18:00" }, update: { modality: "Presencial", availabilityText: "Lun a vie 9:00 - 18:00" } } },
    },
    create: {
      type: ListingType.SERVICE,
      status: ListingStatus.PUBLISHED,
      slug: "playwright-service-demo",
      title: "Servicio demo Playwright",
      description: "Publicación de prueba para capturas visuales.",
      categoryId: serviceCategory.id,
      providerId: provider.id,
      featured: true,
      priceType: PriceType.FROM,
      price: new Prisma.Decimal(12000),
      currency: "ARS",
      locationText: "Tucumán",
      publishedAt: new Date(),
      media: { create: [{ archivo: placeholderSvg("Servicio demo"), mimeType: "image/svg+xml", size: null, sortOrder: 0 }] },
      service: { create: { modality: "Presencial", availabilityText: "Lun a vie 9:00 - 18:00" } },
    },
    include: { service: true },
  })

  const product = await prisma.listing.upsert({
    where: { slug: "playwright-product-demo" },
    update: {
      status: ListingStatus.PUBLISHED,
      featured: false,
      priceType: PriceType.PER_UNIT,
      price: new Prisma.Decimal(2450),
      priceUnit: "por unidad",
      media: { deleteMany: {}, create: [{ archivo: placeholderSvg("Producto demo"), mimeType: "image/svg+xml", size: null, sortOrder: 0 }] },
      product: { upsert: { create: { unit: "unidad", fulfillment: FulfillmentType.DELIVERY, trackStock: false }, update: { unit: "unidad", fulfillment: FulfillmentType.DELIVERY, trackStock: false } } },
    },
    create: {
      type: ListingType.PRODUCT,
      status: ListingStatus.PUBLISHED,
      slug: "playwright-product-demo",
      title: "Producto demo Playwright",
      description: "Publicación de producto para capturas visuales.",
      categoryId: productCategory.id,
      providerId: provider.id,
      featured: false,
      priceType: PriceType.PER_UNIT,
      price: new Prisma.Decimal(2450),
      currency: "ARS",
      priceUnit: "por unidad",
      locationText: "Tucumán",
      publishedAt: new Date(),
      media: { create: [{ archivo: placeholderSvg("Producto demo"), mimeType: "image/svg+xml", size: null, sortOrder: 0 }] },
      product: { create: { unit: "unidad", fulfillment: FulfillmentType.DELIVERY, trackStock: false } },
    },
    include: { product: true },
  })

  const booking = await prisma.booking.findFirst({ where: { listingId: service.id, clientId: client.id, providerId: provider.id } }) ?? await prisma.booking.create({
    data: {
      listingId: service.id,
      clientId: client.id,
      providerId: provider.id,
      status: BookingStatus.CONFIRMED,
      startsAt: new Date(Date.now() + 86_400_000),
      endsAt: new Date(Date.now() + 90_000_000),
      timezone: "America/Argentina/Tucuman",
      notes: "Turno de prueba para capturas.",
    },
  })

  const inquiry = await prisma.productInquiry.findFirst({ where: { clientId: client.id, providerId: provider.id } }) ?? await prisma.productInquiry.create({
    data: {
      clientId: client.id,
      providerId: provider.id,
      status: InquiryStatus.RESPONDED,
      notes: "Consulta demo para capturas.",
      items: { create: [{ listingId: product.id, quantity: new Prisma.Decimal(4), requestedUnit: "unidad", priceSnapshot: new Prisma.Decimal(2450), titleSnapshot: product.title, notes: "Entrega inmediata" }] },
      quotes: { create: [{ providerId: provider.id, version: 1, amount: new Prisma.Decimal(9800), currency: "ARS", breakdown: "4 unidades x 2450", conditions: "Válido 7 días" }] },
    },
  })

  return {
    service: { id: service.id, slug: service.slug },
    product: { id: product.id, slug: product.slug },
    bookingId: booking.id,
    inquiryId: inquiry.id,
    clientEmail: client.email,
    providerEmail: provider.email,
    adminEmail: admin.email,
  }
}

export async function cleanupVisualFixtures() {
  await prisma.productInquiryQuote.deleteMany({ where: { inquiry: { notes: { contains: "Consulta demo" } } } }).catch(() => {})
  await prisma.productInquiryItem.deleteMany({ where: { titleSnapshot: "Producto demo Playwright" } }).catch(() => {})
  await prisma.productInquiry.deleteMany({ where: { notes: { contains: "Consulta demo" } } }).catch(() => {})
  await prisma.booking.deleteMany({ where: { notes: { contains: "Turno de prueba" } } }).catch(() => {})
  await prisma.listingMedia.deleteMany({ where: { listing: { slug: { in: ["playwright-service-demo", "playwright-product-demo"] } } } }).catch(() => {})
  await prisma.serviceDetails.deleteMany({ where: { listing: { slug: "playwright-service-demo" } } }).catch(() => {})
  await prisma.productDetails.deleteMany({ where: { listing: { slug: "playwright-product-demo" } } }).catch(() => {})
  await prisma.listing.deleteMany({ where: { slug: { in: ["playwright-service-demo", "playwright-product-demo"] } } }).catch(() => {})
  await prisma.category.deleteMany({ where: { slug: { in: ["servicios-demo", "productos-demo"] } } }).catch(() => {})
}
