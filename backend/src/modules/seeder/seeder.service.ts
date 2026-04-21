import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSeeder } from './data-seeders/data-seeder';
import { DevDataSeeder } from './data-seeders/dev-data-seeder';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(
    private readonly dataSeederService: DataSeeder,
    private readonly devDataSeederService: DevDataSeeder,
  ) {}

  onApplicationBootstrap() {
    setImmediate(() => {
      // do something
      void this.execute();
    });
  }

  public async execute() {
    await this.dataSeederService.execute();
    await this.devDataSeederService.execute();
  }
}
