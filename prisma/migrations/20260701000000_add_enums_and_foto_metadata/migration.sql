-- CreateEnum: Role
CREATE TYPE "Role" AS ENUM ('CLIENT', 'PROVIDER', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING ("role"::"Role");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CLIENT';

-- CreateEnum: TipoFoto
CREATE TYPE "TipoFoto" AS ENUM ('SERVICIO', 'PERFIL', 'OPINION', 'TRABAJO');
ALTER TABLE "Foto" ALTER COLUMN "tipo" DROP DEFAULT;
ALTER TABLE "Foto" ALTER COLUMN "tipo" TYPE "TipoFoto" USING ("tipo"::"TipoFoto");
ALTER TABLE "Foto" ALTER COLUMN "tipo" SET DEFAULT 'SERVICIO';

-- CreateEnum: ReportMotivo
CREATE TYPE "ReportMotivo" AS ENUM ('SPAM', 'FALSO', 'INADECUADO', 'OTRO');
ALTER TABLE "Report" ALTER COLUMN "motivo" TYPE "ReportMotivo" USING ("motivo"::"ReportMotivo");

-- CreateEnum: ReportEstado
CREATE TYPE "ReportEstado" AS ENUM ('PENDIENTE', 'REVISADO', 'RESUELTO');
ALTER TABLE "Report" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Report" ALTER COLUMN "estado" TYPE "ReportEstado" USING ("estado"::"ReportEstado");
ALTER TABLE "Report" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';

-- CreateEnum: BudgetStatus
CREATE TYPE "BudgetStatus" AS ENUM ('PENDIENTE', 'COTIZADO', 'ACEPTADO', 'RECHAZADO', 'REVISION');
ALTER TABLE "BudgetRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "BudgetRequest" ALTER COLUMN "status" TYPE "BudgetStatus" USING ("status"::"BudgetStatus");
ALTER TABLE "BudgetRequest" ALTER COLUMN "status" SET DEFAULT 'PENDIENTE';

-- AlterTable: add size and mimeType to Foto
ALTER TABLE "Foto" ADD COLUMN IF NOT EXISTS "size" INTEGER;
ALTER TABLE "Foto" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
