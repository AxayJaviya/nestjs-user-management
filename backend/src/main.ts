import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import * as process from 'process';
import { AppModule } from './app.module';

// Load the appropriate .env file based on NODE_ENV
const envFilePath = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFilePath });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up Swagger
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

  // Enable cross-origin requests
  app.enableCors();

  // Add security headers
  app.use(helmet());

  // Add global prefix for API routes
  app.setGlobalPrefix('api');

  app.enableVersioning();

  // Get port from environment or use default
  const port = 3000; // We can also add this in our .env file
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
