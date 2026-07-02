-- Add social media fields to User and Servicio tables
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "facebook" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "facebook" TEXT;
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
