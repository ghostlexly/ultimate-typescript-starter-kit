import { bootstrap } from "./app";
import { configService } from "./common/services/config.service";
import { Logger } from "./common/utils/logger";

const logger = new Logger("server");

const setup = async () => {
  try {
    const app = await bootstrap();
    const PORT = configService.getOrThrow("APP_PORT");

    // Start server
    app.listen(PORT, () => {
      // Log server ready
      logger.info(`🚀 Server ready on port: ${PORT}`);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

setup();
