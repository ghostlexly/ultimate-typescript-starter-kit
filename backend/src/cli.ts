import { CommandFactory } from 'nest-commander';
import { CliModule } from './features/cli/cli.module';

async function bootstrap() {
  await CommandFactory.run(CliModule, ['warn', 'error', 'debug', 'verbose']);
}

bootstrap();
