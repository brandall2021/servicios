-- AlterTable
ALTER TABLE "User" ADD COLUMN "solicitudProveedor" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ContactView" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactView_targetId_targetType_idx" ON "ContactView"("targetId", "targetType");

-- CreateIndex
CREATE INDEX "ContactView_createdAt_idx" ON "ContactView"("createdAt");
