import {
  Injectable,
  NestInterceptor,
  Logger,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('Logger');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    // request method
    const ctxStack = ctx.getArgs()[0].route.stack[0].method;
    // route path
    const ctxPath = ctx.getArgs()[0].route.path;
    // status code
    const ctxStatus = ctx.getArgs()[1].statusCode;

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `[${ctxStatus}] ${ctxStack.toUpperCase()} { ${ctxPath} }`,
        );
      }),
    );
  }
}
