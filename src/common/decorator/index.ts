import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: Request = context.switchToHttp().getRequest();
    return (<any>req).user;
  },
);
