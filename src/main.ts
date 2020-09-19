import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import * as helmet from 'helmet';
import * as xss from 'xss-clean'; // @types/xss-clean
import * as hpp from 'hpp';
import * as rateLimit from 'express-rate-limit';
import * as mongoSanitize from 'express-mongo-sanitize';
import * as bodyParser from 'body-parser';
import { NODE_ENV } from './config';
import { LoggingInterceptor /*HttpExeceptionFilter*/ } from './common';

async function bootstrap() {
  try {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(helmet());
    app.use(xss());
    app.use(hpp());

    app.use(
      mongoSanitize({
        replaceWith: '_',
      }),
    );

    app.use(
      rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100,
        message: 'Too many requests...',
      }),
    );

    if (NODE_ENV === 'development') {
      app.useGlobalInterceptors(new LoggingInterceptor());
    }

    // app.useGlobalFilters(new HttpExeceptionFilter());

    const PORT: number = parseInt(process.env.PORT) || 3003;
    await app.listen(PORT);

    logger.log(`Server running on: http://localhost:${PORT}/bp/v1/`);
  } catch (err) {
    console.log(`Error starting server: ${err.message}`);
    throw new InternalServerErrorException(err.message);
  }
}
bootstrap();
