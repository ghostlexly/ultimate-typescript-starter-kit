import { Injectable } from '@nestjs/common';
import { Database } from '../../core/database/database.js';

@Injectable()
export class AppRepository {
  constructor(private readonly db: Database) {}

  findAll() {
    return this.db.query.appConfigs.findMany();
  }
}
