import { Module } from '@nestjs/common';
import { DataSeeder } from './data-seeders/data-seeder';
import { DevDataSeeder } from './data-seeders/dev-data-seeder';
import { AuthModule } from '../auth/auth.module';
import { SeederService } from './seeder.service';

@Module({
  imports: [AuthModule],
  providers: [SeederService, DataSeeder, DevDataSeeder],
})
export class SeederModule {}
