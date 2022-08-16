import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Device = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const { device } = context.switchToHttp().getRequest();
    return device;
  },
);

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();
    return user;
  },
);
