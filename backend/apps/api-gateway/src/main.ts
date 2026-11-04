import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createGatewayProxy } from './proxy/gateway.proxy';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors();
  app.use(createGatewayProxy(config));
  app.enableShutdownHooks();
  await app.listen(config.get<number>('GATEWAY_PORT', 3000));
}

bootstrap();
