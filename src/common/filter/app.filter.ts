import {
  ArgumentsHost,
  Catch,
  ConsoleLogger,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { ErrorCode, ErrorObject, getHttpExceptionError } from '../error/error';

@Catch()
export class AppErrorFilter implements ExceptionFilter {
  private logger = new ConsoleLogger('ErrorFilter', { timestamp: true });

  catch(error: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    var status: number;
    var errRes: ErrorObject;

    this.logger.error(error.stack);

    if (error instanceof HttpException) {
      status = error.getStatus();
      if (status == HttpStatus.UNAUTHORIZED) {
        errRes = getHttpExceptionError(ErrorCode.UNAUTHORIZED);
      } else {
        errRes = error.getResponse() as ErrorObject;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errRes = getHttpExceptionError(ErrorCode.INTERNAL_SERVER_ERROR);
    }

    res.status(status).json({
      status: 'failed',
      message: errRes.message,
      error: errRes.error,
    });
  }
}
