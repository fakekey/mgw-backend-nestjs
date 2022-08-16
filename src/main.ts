import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { AppModule } from './app.module';
import { PrismaService } from './common/prisma/prisma.service';

(async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const env = app.get(ConfigService);
  const prisma = app.get(PrismaService);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix(env.get('API_PREFIX'));
  app.useStaticAssets(join(__dirname, `..${env.get('PUBLIC_ASSETS_PATH')}`));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
    }),
  );
  await prisma.enableShutdownHooks(app);
  await app.listen(env.get('PORT') || 3000);
})();
