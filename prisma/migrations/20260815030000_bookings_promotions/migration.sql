CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_PROVIDER', 'COMPLETED', 'NO_SHOW');
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'PROMOTIONAL_PRICE', 'BENEFIT');

CREATE TABLE "Booking" (
  "id" TEXT PRIMARY KEY,
  "listingId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "timezone" TEXT NOT NULL,
  "notes" TEXT,
  "cancellationReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Booking_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Booking_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Booking_providerId_startsAt_endsAt_idx" ON "Booking"("providerId", "startsAt", "endsAt");
CREATE INDEX "Booking_clientId_startsAt_idx" ON "Booking"("clientId", "startsAt");

CREATE TABLE "Promotion" (
  "id" TEXT PRIMARY KEY,
  "providerId" TEXT NOT NULL,
  "listingId" TEXT,
  "type" "PromotionType" NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "value" DECIMAL(12,2),
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "usageLimit" INTEGER,
  "perUserLimit" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "terms" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Promotion_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Promotion_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Promotion_providerId_code_key" ON "Promotion"("providerId", "code");
CREATE INDEX "Promotion_listingId_active_startsAt_endsAt_idx" ON "Promotion"("listingId", "active", "startsAt", "endsAt");
