import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../src/modules/shared/services/database.service';

export const TEST_CITIES = {
  marseille: {
    name: 'Marseille',
    inseeCode: '13055',
    departmentCode: '13',
    regionCode: '93',
    population: 877215,
    postalCodes: [
      '13001',
      '13002',
      '13003',
      '13004',
      '13005',
      '13006',
      '13007',
      '13008',
      '13009',
      '13010',
      '13011',
      '13012',
      '13013',
      '13014',
      '13015',
      '13016',
    ],
  },
  seillons: {
    name: "Seillons-Source-d'Argens",
    inseeCode: '83125',
    departmentCode: '83',
    regionCode: '93',
    population: 2717,
    postalCodes: ['83470'],
  },
} as const;

@Injectable()
export class TestCitiesFixture {
  constructor(private readonly db: DatabaseService) {}

  async seed(): Promise<void> {
    await this.seedCities();
  }

  private async seedCities(): Promise<void> {
    await this.db.prisma.city.create({
      data: {
        name: TEST_CITIES.marseille.name,
        inseeCode: TEST_CITIES.marseille.inseeCode,
        departmentCode: TEST_CITIES.marseille.departmentCode,
        regionCode: TEST_CITIES.marseille.regionCode,
        population: TEST_CITIES.marseille.population,
        postalCodes: {
          createMany: {
            data: TEST_CITIES.marseille.postalCodes.map((postalCode) => ({
              postalCode,
            })),
          },
        },
      },
    });

    await this.db.prisma.city.create({
      data: {
        name: TEST_CITIES.seillons.name,
        inseeCode: TEST_CITIES.seillons.inseeCode,
        departmentCode: TEST_CITIES.seillons.departmentCode,
        regionCode: TEST_CITIES.seillons.regionCode,
        population: TEST_CITIES.seillons.population,
        postalCodes: {
          createMany: {
            data: TEST_CITIES.seillons.postalCodes.map((postalCode) => ({
              postalCode,
            })),
          },
        },
      },
    });
  }
}
