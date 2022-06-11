import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode, getHttpExceptionError } from '../error';

@Catch(BadRequestException)
export class InvalidParameterFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const error = getHttpExceptionError(ErrorCode.INVALID_PARAMETER);
    response.status(error.statusCode).json(error);
  }
}
