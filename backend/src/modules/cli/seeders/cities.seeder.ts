import { Injectable, Logger } from '@nestjs/common';
import {
  DatabaseService,
  PrismaTransactionClient,
} from '../../shared/services/database.service';
import path from 'path';
import fs from 'fs/promises';

interface CityData {
  nom: string;
  code: string;
  codeDepartement: string;
  siren: string;
  codeEpci: string;
  codeRegion: string;
  codesPostaux: string[];
  population: number;
}

/**
 * Seed towns from INSEE data
 *
 * File: communes.json
 * Source: https://geo.api.gouv.fr/communes
 */
@Injectable()
export class CitiesSeeder {
  private logger = new Logger(CitiesSeeder.name);

  constructor(private readonly db: DatabaseService) {}

  async seed(): Promise<void> {
    this.logger.debug('Starting cities seeding...');

    const cities = await this.getCities();

    const batchSize = 500;
    let totalSeeded = 0;

    for (let i = 0; i < cities.length; i += batchSize) {
      const batch = cities.slice(i, i + batchSize);

      await this.db.prisma.$transaction(async (tx: PrismaTransactionClient) => {
        for (const city of batch) {
          await tx.city.upsert({
            where: { inseeCode: city.code },
            update: {
              departmentCode: city.codeDepartement,
              regionCode: city.codeRegion,
              name: city.nom,
              population: city.population,
              postalCodes: {
                deleteMany: {},
                create: city.codesPostaux.map((code) => ({
                  postalCode: code,
                })),
              },
            },
            create: {
              inseeCode: city.code,
              departmentCode: city.codeDepartement,
              regionCode: city.codeRegion,
              name: city.nom,
              population: city.population,
              postalCodes: {
                create: city.codesPostaux.map((code) => ({
                  postalCode: code,
                })),
              },
            },
          });
        }
      });

      totalSeeded += batch.length;
      this.logger.debug(
        `Seeded ${totalSeeded} / ${cities.length} cities (${Math.round((totalSeeded / cities.length) * 100)}%)`,
      );
    }

    this.logger.debug(
      `Cities seeding completed. Total cities seeded: ${totalSeeded}`,
    );
  }

  private async getCities(): Promise<CityData[]> {
    const citiesData = await fs.readFile(
      path.join(__dirname, 'data', 'communes.json'),
      'utf-8',
    );

    const citiesParsed = JSON.parse(citiesData);

    return citiesParsed;
  }
}
