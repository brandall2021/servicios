CREATE TYPE "InquiryStatus" AS ENUM ('DRAFT', 'SENT', 'RESPONDED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

CREATE TABLE "ProductInquiry" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "status" "InquiryStatus" NOT NULL DEFAULT 'DRAFT',
  "deliveryMethod" "FulfillmentType",
  "deliveryAddress" TEXT,
  "notes" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductInquiry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProductInquiry_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ProductInquiryItem" (
  "id" TEXT PRIMARY KEY,
  "inquiryId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "quantity" DECIMAL(12,3) NOT NULL,
  "requestedUnit" TEXT,
  "priceSnapshot" DECIMAL(12,2),
  "titleSnapshot" TEXT NOT NULL,
  "notes" TEXT,
  CONSTRAINT "ProductInquiryItem_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "ProductInquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProductInquiryItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ProductInquiryItem_inquiryId_listingId_key" ON "ProductInquiryItem"("inquiryId", "listingId");

CREATE TABLE "ProductInquiryQuote" (
  "id" TEXT PRIMARY KEY,
  "inquiryId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'ARS',
  "breakdown" TEXT,
  "conditions" TEXT,
  "validUntil" TIMESTAMP(3),
  "estimatedReadyAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductInquiryQuote_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "ProductInquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProductInquiryQuote_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ProductInquiryQuote_inquiryId_version_key" ON "ProductInquiryQuote"("inquiryId", "version");
CREATE INDEX "ProductInquiryQuote_providerId_createdAt_idx" ON "ProductInquiryQuote"("providerId", "createdAt");
CREATE INDEX "ProductInquiry_clientId_status_updatedAt_idx" ON "ProductInquiry"("clientId", "status", "updatedAt");
CREATE INDEX "ProductInquiry_providerId_status_updatedAt_idx" ON "ProductInquiry"("providerId", "status", "updatedAt");
