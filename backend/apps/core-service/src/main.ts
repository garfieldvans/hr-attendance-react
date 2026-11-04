import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { uploadDirectory } from '../../../libs/common/src';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useStaticAssets(uploadDirectory(), { prefix: '/files/' });
  app.enableShutdownHooks();
  await app.listen(config.get<number>('CORE_PORT', 3002));
}

bootstrap();
