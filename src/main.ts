import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Static files (yuklangan rasmlar uchun)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Swagger konfiguratsiyasi
  const config = new DocumentBuilder()
    .setTitle("O'quv Markazi CRM API")
    .setDescription(
      `
      ## O'quv markazi boshqaruv tizimi API hujjatlari
      
      ### Rollar:
      - **SUPERADMIN** — Tizimning bosh administratori. Admin tayinlay oladi.
      - **ADMIN** — O'quv markazi administratori. Barcha CRUD operatsiyalari.
      - **TEACHER** — O'qituvchi. Davomat va guruhlarini boshqara oladi.
      
      ### Auth:
      1. \`POST /api/auth/login\` — Kirish (barcha rollar)
      2. Token olib, **Authorize** tugmasini bosing
      3. \`Bearer {token}\` formatida kiriting
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT tokenni kiriting',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Kirish va foydalanuvchi boshqaruvi')
    .addTag('Students', "O'quvchilar boshqaruvi")
    .addTag('Groups', 'Guruhlar boshqaruvi')
    .addTag('Payments', "To'lovlar boshqaruvi")
    .addTag('Attendance', 'Davomat boshqaruvi')
    .addTag('Complaints', 'Murojatlar boshqaruvi')
    .addTag('Dashboard', 'Statistika va xisobotlar')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: "CRM API Hujjatlari",
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 Server ishga tushdi: http://localhost:${port}`);
  console.log(`📚 Swagger hujjatlari: http://localhost:${port}/api/docs\n`);
}

bootstrap();
