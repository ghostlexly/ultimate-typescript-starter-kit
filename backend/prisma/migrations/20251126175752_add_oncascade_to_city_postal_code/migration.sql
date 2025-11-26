-- DropForeignKey
ALTER TABLE "CityPostalCode" DROP CONSTRAINT "CityPostalCode_cityId_fkey";

-- AddForeignKey
ALTER TABLE "CityPostalCode" ADD CONSTRAINT "CityPostalCode_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
