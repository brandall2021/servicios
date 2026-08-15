-- Marketplace base domain

CREATE TYPE "ListingType" AS ENUM ('SERVICE', 'PRODUCT');
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'REJECTED', 'ARCHIVED');
CREATE TYPE "PriceType" AS ENUM ('FIXED', 'FROM', 'PER_UNIT', 'QUOTE');
CREATE TYPE "ProviderApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "QuoteRequestStatus" AS ENUM ('PENDING', 'QUOTED', 'REVISION_REQUESTED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "FulfillmentType" AS ENUM ('PICKUP', 'DELIVERY', 'BOTH');
CREATE TYPE "ProviderKind" AS ENUM ('PERSONA', 'EMPRESA');
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'SUSPENDED');

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "type" "ListingType" NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "icon" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "parentId" TEXT,

  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProviderProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind" "ProviderKind" NOT NULL,
  "tradeName" TEXT NOT NULL,
  "description" TEXT,
  "taxId" TEXT,
  "phone" TEXT,
  "whatsapp" TEXT,
  "website" TEXT,
  "facebook" TEXT,
  "instagram" TEXT,
  "coverageText" TEXT,
  "province" TEXT,
  "city" TEXT,
  "coverageRadiusKm" INTEGER,
  "offersServices" BOOLEAN NOT NULL DEFAULT true,
  "offersProducts" BOOLEAN NOT NULL DEFAULT false,
  "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
  "verifiedAt" TIMESTAMP(3),
  "responseTimeMinutes" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProviderProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProviderApplication" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "ProviderApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "rejectionReason" TEXT,
  "suspensionReason" TEXT,
  "documents" JSONB,

  CONSTRAINT "ProviderApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProviderApplicationEvent" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "note" TEXT,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProviderApplicationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Listing" (
  "id" TEXT NOT NULL,
  "type" "ListingType" NOT NULL,
  "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "providerProfileId" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "priceType" "PriceType" NOT NULL,
  "price" DECIMAL(12,2),
  "currency" TEXT NOT NULL DEFAULT 'ARS',
  "priceUnit" TEXT,
  "locationText" TEXT,
  "latitude" DECIMAL(9,6),
  "longitude" DECIMAL(9,6),
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServiceDetails" (
  "listingId" TEXT NOT NULL,
  "modality" TEXT,
  "coverageRadiusKm" INTEGER,
  "durationText" TEXT,
  "availabilityText" TEXT,
  "includesText" TEXT,
  "excludesText" TEXT,

  CONSTRAINT "ServiceDetails_pkey" PRIMARY KEY ("listingId")
);

CREATE TABLE "ProductDetails" (
  "listingId" TEXT NOT NULL,
  "sku" TEXT,
  "brand" TEXT,
  "unit" TEXT NOT NULL,
  "stockQuantity" DECIMAL(12,3),
  "trackStock" BOOLEAN NOT NULL DEFAULT false,
  "minimumOrder" DECIMAL(12,3),
  "fulfillment" "FulfillmentType" NOT NULL DEFAULT 'PICKUP',
  "deliveryText" TEXT,

  CONSTRAINT "ProductDetails_pkey" PRIMARY KEY ("listingId")
);

CREATE TABLE "ListingMedia" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "archivo" TEXT NOT NULL,
  "mimeType" TEXT,
  "size" INTEGER,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ListingMedia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuoteRequest" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "status" "QuoteRequestStatus" NOT NULL DEFAULT 'PENDING',
  "description" TEXT,
  "quantity" DECIMAL(12,3),
  "unit" TEXT,
  "fulfillment" "FulfillmentType",
  "desiredDate" TIMESTAMP(3),
  "locationText" TEXT,
  "attachments" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Quote" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'ARS',
  "breakdown" TEXT,
  "conditions" TEXT,
  "validUntil" TIMESTAMP(3),
  "estimatedReadyAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuoteRequestHistory" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "fromStatus" "QuoteRequestStatus",
  "toStatus" "QuoteRequestStatus" NOT NULL,
  "action" TEXT NOT NULL,
  "note" TEXT,
  "payload" JSONB,
  "actorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "QuoteRequestHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_type_slug_key" ON "Category"("type", "slug");
CREATE INDEX "Category_type_active_sortOrder_idx" ON "Category"("type", "active", "sortOrder");
CREATE UNIQUE INDEX "ProviderProfile_userId_key" ON "ProviderProfile"("userId");
CREATE UNIQUE INDEX "ProviderApplication_userId_key" ON "ProviderApplication"("userId");
CREATE INDEX "ProviderApplication_status_submittedAt_idx" ON "ProviderApplication"("status", "submittedAt");
CREATE INDEX "ProviderApplicationEvent_applicationId_createdAt_idx" ON "ProviderApplicationEvent"("applicationId", "createdAt");
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");
CREATE INDEX "Listing_type_status_categoryId_idx" ON "Listing"("type", "status", "categoryId");
CREATE INDEX "Listing_providerId_status_idx" ON "Listing"("providerId", "status");
CREATE INDEX "Listing_providerProfileId_status_idx" ON "Listing"("providerProfileId", "status");
CREATE INDEX "Listing_status_publishedAt_idx" ON "Listing"("status", "publishedAt");
CREATE INDEX "Listing_price_idx" ON "Listing"("price");
CREATE INDEX "ProductDetails_sku_idx" ON "ProductDetails"("sku");
CREATE INDEX "ProductDetails_brand_idx" ON "ProductDetails"("brand");
CREATE INDEX "ListingMedia_listingId_sortOrder_idx" ON "ListingMedia"("listingId", "sortOrder");
CREATE INDEX "QuoteRequest_listingId_status_idx" ON "QuoteRequest"("listingId", "status");
CREATE INDEX "QuoteRequest_clientId_status_idx" ON "QuoteRequest"("clientId", "status");
CREATE UNIQUE INDEX "Quote_requestId_version_key" ON "Quote"("requestId", "version");
CREATE INDEX "Quote_providerId_createdAt_idx" ON "Quote"("providerId", "createdAt");
CREATE INDEX "QuoteRequestHistory_requestId_createdAt_idx" ON "QuoteRequestHistory"("requestId", "createdAt");
CREATE INDEX "QuoteRequestHistory_actorId_createdAt_idx" ON "QuoteRequestHistory"("actorId", "createdAt");

ALTER TABLE "ProviderProfile" ADD CONSTRAINT "ProviderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderApplication" ADD CONSTRAINT "ProviderApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderApplication" ADD CONSTRAINT "ProviderApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProviderApplicationEvent" ADD CONSTRAINT "ProviderApplicationEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ProviderApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderApplicationEvent" ADD CONSTRAINT "ProviderApplicationEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ServiceDetails" ADD CONSTRAINT "ServiceDetails_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductDetails" ADD CONSTRAINT "ProductDetails_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingMedia" ADD CONSTRAINT "ListingMedia_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteRequestHistory" ADD CONSTRAINT "QuoteRequestHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteRequestHistory" ADD CONSTRAINT "QuoteRequestHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
