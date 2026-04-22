import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // --- Swagger Config ---
  const config = new DocumentBuilder()
    .setTitle('UpperSilver E-commerce API')
    .setDescription('Servicios backend para la tienda UpperSilver')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  // ----------------------

  await app.listen(process.env.PORT ?? 8080, '0.0.0.0');
}
bootstrap();
