import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';
import { setupSwagger } from '@setupSwagger';

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

  // setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
