import { appService } from "#/shared/services/app.service";

afterAll(async () => {
  // Close all connections
  await appService.cleanup();
});
