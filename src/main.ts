import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as hbs from 'hbs';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.use(helmet());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  // Configurer le moteur de vue
  app.setViewEngine('hbs');

  // Spécifier le chemin des fichiers de vue
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Pour Handlebars, enregistrez les partials si nécessaire
  hbs.registerPartials(join(__dirname, '..', 'views/partials'));
  await app.listen(3000);
}
bootstrap();
