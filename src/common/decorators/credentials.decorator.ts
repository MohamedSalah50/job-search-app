import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    let req: any;
    switch (context.getType<string>()) {
      case 'http':
        req = context.switchToHttp().getRequest();
        break;
      // case 'rpc':
      //     const rpcCtx = context.switchToRpc();
      //     break;
      // case 'ws':
      //     const wsCtx = context.switchToWs();
      //     break;

      case 'graphql':
        req =
          GqlExecutionContext.create(context).getContext().req.credentials.user
            .role;
        break;
      default:
        break;
    }
    return req.credentials.user;
  },
);
