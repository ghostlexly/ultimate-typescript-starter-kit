-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "countryCode" TEXT;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("iso2Code") ON DELETE SET NULL ON UPDATE CASCADE;
