import { Injectable, Logger } from '@nestjs/common';
import {
  DatabaseService,
  PrismaTransactionClient,
} from '../../application/services/database.service';
import communesData from './data/communes.json';

interface CommuneData {
  nom: string;
  code: string;
  codeDepartement: string;
  siren: string;
  codeEpci: string;
  codeRegion: string;
  codesPostaux: string[];
  population: number;
}

@Injectable()
export class CitiesSeeder {
  private logger = new Logger(CitiesSeeder.name);

  constructor(private readonly db: DatabaseService) {}

  async seed(): Promise<void> {
    this.logger.debug('Starting cities seeding...');

    const communes: CommuneData[] = Array.isArray(communesData)
      ? communesData
      : (communesData as any).default || [];
    const batchSize = 500;
    let totalSeeded = 0;

    for (let i = 0; i < communes.length; i += batchSize) {
      const batch = communes.slice(i, i + batchSize);

      await this.db.prisma.$transaction(async (tx: PrismaTransactionClient) => {
        for (const commune of batch) {
          const city = await tx.city.upsert({
            where: { inseeCode: commune.code },
            create: {
              inseeCode: commune.code,
              departmentCode: commune.codeDepartement,
              regionCode: commune.codeRegion,
              name: commune.nom,
              population: commune.population,
            },
            update: {
              departmentCode: commune.codeDepartement,
              regionCode: commune.codeRegion,
              name: commune.nom,
              population: commune.population,
            },
          });

          await tx.cityPostalCode.deleteMany({
            where: { cityId: city.id },
          });

          if (commune.codesPostaux.length > 0) {
            await tx.cityPostalCode.createMany({
              data: commune.codesPostaux.map((postalCode: string) => ({
                postalCode,
                cityId: city.id,
              })),
            });
          }
        }
      });

      totalSeeded += batch.length;
      this.logger.debug(
        `Seeded ${totalSeeded} / ${communes.length} cities (${Math.round((totalSeeded / communes.length) * 100)}%)`,
      );
    }

    this.logger.debug(
      `Cities seeding completed. Total cities seeded: ${totalSeeded}`,
    );
  }
}
