import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as dotenv from 'dotenv';
import * as process from 'process';
import { AppModule } from './app.module';

// Load the appropriate .env file based on NODE_ENV
const envFilePath = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFilePath });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('NestJS User Management APIs')
    .setDescription(
      'API documentation for managing user registration, authentication, and profile management',
    )
    .setVersion('1.0')
    .addTag('users', 'Operations related to user management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Apply validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = 3000;
  await app.listen(port);
}

bootstrap();
