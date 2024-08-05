import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import * as process from 'process';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exception-filters/all-exceptions.filter';

// Load environment variables
dotenv.config({ path: '.env' });

async function bootstrap() {
  // Create the Nest application
  const app = await NestFactory.create(AppModule);

  // Add global prefix for API routes
  app.setGlobalPrefix('api');

  // Enable API versioning
  app.enableVersioning();

  // Enable cross-origin requests
  app.enableCors();

  // Add security headers
  app.use(helmet());

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Register global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Set up Swagger for API documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS User Management APIs')
    .setDescription(
      'API documentation for managing user registration, authentication, and profile management',
    )
    .setVersion('1.0')
    .addTag('users', 'Operations related to user management')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  // Determine the port to listen on
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
