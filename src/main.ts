import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
        }),
    );

    // Global API prefix
    app.setGlobalPrefix('api');

    // Swagger Configuration
    const config = new DocumentBuilder()
        .setTitle('Strategy Repository API')
        .setDescription('Consolidated API for Strategy Management, Finances, and Auth')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // CORS
    app.enableCors();

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 Strategy Repository API running on: http://localhost:${port}/api`);
    logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
