import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';
import { setupSwagger } from '@setupSwagger';
import { PrismaExceptionFilter } from '@exception-filters/prisma-exception.filter';
import { HttpExceptionFilter } from '@exception-filters/http-exception.filter';
import { ResponseFormatInterceptor } from '@interceptors/response-format.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors();
  app.setGlobalPrefix('api');

  app.use(
    '/docs*',
    basicAuth({
      challenge: true,
      users: {
        swaggerAdmin: process.env.SWAGGER_PASSWORD,
      },
    }),
  );

  setupSwagger(app);

  app.useGlobalInterceptors(new ResponseFormatInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
