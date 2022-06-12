import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './common/prisma';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: '*' });
  app.use(helmet());
  const config = app.get(ConfigService);
  app.setGlobalPrefix(config.get('API_PREFIX'));
  app.useStaticAssets(join(__dirname, `..${config.get('STATIC_ASSETS_PATH')}`));
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);
  await app.listen(config.get('PORT') || 3000);
}
bootstrap();
