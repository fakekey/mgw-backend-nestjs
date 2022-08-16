import { HttpException, HttpStatus } from '@nestjs/common';

export type ErrorObject = {
  statusCode: number;
  message: unknown;
  error: string;
};

const ErrorDict = new Map<string, ErrorObject>([
  [
    'EMAIL_EXISTED',
    {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Email has already existed',
      error: 'Email Existed',
    },
  ],
  [
    'INTERNAL_SERVER_ERROR',
    {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Oops, something went wrong',
      error: 'Server Error',
    },
  ],
  [
    'INVALID_PARAMETER',
    {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Parameters have provided are invalid',
      error: 'Invalid Parameter',
    },
  ],
  [
    'WRONG_CREDENTIALS',
    {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Wrong credentials provided',
      error: 'Wrong Credentials',
    },
  ],
  [
    'UNAUTHORIZED',
    {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Your request is not allowed',
      error: 'Unauthorized',
    },
  ],
]);

export enum ErrorCode {
  EMAIL_EXISTED = 'EMAIL_EXISTED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  WRONG_CREDENTIALS = 'WRONG_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export function throwHttpException(errorCode: ErrorCode, message?: string) {
  const error = ErrorDict.get(errorCode);
  if (message) error.message = message;
  throw new HttpException(error, error.statusCode);
}

export function getHttpExceptionError(errorCode: ErrorCode, message?: string) {
  const error = ErrorDict.get(errorCode);
  if (message) error.message = message;
  return error;
}
