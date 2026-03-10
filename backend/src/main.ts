import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // ตัด field แปลกที่ไม่ได้ใน DTO ออก
    forbidNonWhitelisted: true, // โยน error ถ้าส่ง field ที่ไม่รู้จักมา
    transform: true,            // แปลง type อัตโนมัติ เช่น string → number
  }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  console.log('App restarting to load new Orders module...');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
