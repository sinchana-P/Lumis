import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Add a simple root route before setting global prefix
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({
      message: 'Lumis Backend API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/api/v1/',
        status: '/api/v1/status',
        docs: '/api/docs'
      },
      timestamp: new Date().toISOString()
    });
  });

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Lumis API')
    .setDescription('Personal intelligence platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
    🚀 Lumis Backend is running!

    📍 API: http://localhost:${port}/api/v1
    📚 Docs: http://localhost:${port}/api/docs
    🎨 Frontend: http://localhost:3000

    ✨ Ready to build something amazing!
  `);
}

bootstrap();
