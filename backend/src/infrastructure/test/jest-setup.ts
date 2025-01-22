import { appService } from "#/shared/services/app.service";
import { initializeTestDb } from "./jest-initialize-db";

beforeAll(async () => {
  await initializeTestDb();
});

afterAll(async () => {
  // Close all connections
  await appService.cleanup();
});
