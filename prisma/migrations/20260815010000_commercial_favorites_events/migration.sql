CREATE TYPE "FavoriteType" AS ENUM ('LISTING', 'PROVIDER');

CREATE TABLE "Favorite" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" "FavoriteType" NOT NULL,
  "listingId" TEXT,
  "providerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Favorite_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");
CREATE UNIQUE INDEX "Favorite_userId_providerId_key" ON "Favorite"("userId", "providerId");
CREATE INDEX "Favorite_userId_type_createdAt_idx" ON "Favorite"("userId", "type", "createdAt");

CREATE TABLE "CommercialEvent" (
  "id" TEXT PRIMARY KEY,
  "type" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "providerId" TEXT,
  "listingId" TEXT,
  "requestId" TEXT,
  "metadata" JSONB,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "CommercialEvent_type_occurredAt_idx" ON "CommercialEvent"("type", "occurredAt");
CREATE INDEX "CommercialEvent_userId_occurredAt_idx" ON "CommercialEvent"("userId", "occurredAt");
CREATE INDEX "CommercialEvent_providerId_occurredAt_idx" ON "CommercialEvent"("providerId", "occurredAt");
CREATE INDEX "CommercialEvent_listingId_occurredAt_idx" ON "CommercialEvent"("listingId", "occurredAt");
