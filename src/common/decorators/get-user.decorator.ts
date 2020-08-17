import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '../../modules/user/interface/user.interface';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): IUser => {
    console.log(data);
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
