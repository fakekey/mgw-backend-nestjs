import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { AppErrorFilter } from './common/filter/app.filter';
import { AppInterceptor } from './common/interceptor/app.interceptor';
import { DeviceDetectorMiddleware } from './common/middleware/device-detector.middleware';
import { PrismaModule } from './common/prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLER_TTL'),
        limit: config.get('THROTTLER_LIMIT'),
      }),
    }),
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AppErrorFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AppInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DeviceDetectorMiddleware).forRoutes('*');
  }
}
