import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import * as dotenv from 'dotenv';
import * as process from 'node:process';
import { AppModule } from './app.module';

// Load the appropriate .env file based on NODE_ENV
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
