import { HttpException, HttpStatus } from '@nestjs/common';

export type ErrorObject = {
  statusCode: number;
  message: string;
  errorCode: string;
};

const ErrorList: { [errorCode: string]: ErrorObject } = {
  EMAIL_EXIST: {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Email has already existed',
    errorCode: 'EMAIL_EXIST',
  },
  INTERNAL_SERVER_ERROR: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Oops, something went wrong',
    errorCode: 'INTERNAL_SERVER_ERROR',
  },
  INVALID_PARAMETER: {
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    message: 'Parameters have provided are invalid',
    errorCode: 'INVALID_PARAMETER',
  },
  WRONG_CREDENTIALS: {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Wrong credentials provided',
    errorCode: 'WRONG_CREDENTIALS',
  },
  UNAUTHORIZED: {
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'Your request is not allowed',
    errorCode: 'UNAUTHORIZED',
  },
};

export enum ErrorCode {
  EMAIL_EXIST = 'EMAIL_EXIST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  WRONG_CREDENTIALS = 'WRONG_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export function throwHttpException(errorCode: ErrorCode, message?: string) {
  const error: ErrorObject = JSON.parse(JSON.stringify(ErrorList[errorCode]));
  if (message) error.message = message;
  throw new HttpException(error, error.statusCode);
}

export function getHttpExceptionError(errorCode: ErrorCode, message?: string) {
  const error: ErrorObject = JSON.parse(JSON.stringify(ErrorList[errorCode]));
  if (message) error.message = message;
  return error;
}
