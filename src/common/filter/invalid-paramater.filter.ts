import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';

import { ErrorCode, getHttpExceptionError } from '../error/error';

@Catch(BadRequestException)
export class InvalidParameterFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const error = getHttpExceptionError(ErrorCode.INVALID_PARAMETER);
    return res.status(error.statusCode).json({
      status: 'failed',
      message: error.message,
      error: error.error,
    });
  }
}
