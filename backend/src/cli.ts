import { CommandFactory } from 'nest-commander';
import { CliModule } from './modules/cli/cli.module';

async function bootstrap() {
  await CommandFactory.run(CliModule, ['warn', 'error', 'debug', 'verbose']);
}

void bootstrap();
