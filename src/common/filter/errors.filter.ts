import {
  ArgumentsHost,
  Catch,
  ConsoleLogger,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode, getHttpExceptionError } from '../error';

@Catch()
export class ErrorsFilter implements ExceptionFilter {
  private readonly logger: ConsoleLogger = new ConsoleLogger('ErrorsFilter');

  catch(error: Error, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      error instanceof HttpException
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(error.stack);
      return response
        .status(status)
        .json(getHttpExceptionError(ErrorCode.INTERNAL_SERVER_ERROR));
    }
    if (status === HttpStatus.UNAUTHORIZED) {
      return response
        .status(status)
        .json(getHttpExceptionError(ErrorCode.UNAUTHORIZED));
    }
    response.status(status).json((<HttpException>error).getResponse());
  }
}
