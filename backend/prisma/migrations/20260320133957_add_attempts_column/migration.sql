-- AlterEnum
ALTER TYPE "VerificationType" ADD VALUE 'LOGIN_CODE';

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0;
