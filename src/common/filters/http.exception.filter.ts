import {
  Catch,
  HttpException,
  ExceptionFilter,
  Logger,
  ArgumentsHost,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExeceptionFilter implements ExceptionFilter {
  private logger = new Logger('HttpExceptionFilter');

  catch(excpt: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const status = excpt.getStatus();

    this.logger.error(`[${status}] ${req.method.toUpperCase()} { ${req.url} }`);

    // custom exception response
    res.status(status).json({
      statusCode: status,
      message: excpt.message,
      timestamps: new Date().toISOString(),
      path: req.url,
      method: req.method,
    });
  }
}
