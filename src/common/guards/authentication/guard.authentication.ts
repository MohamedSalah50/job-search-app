import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { tokenName } from 'src/common/decorators/tokenType.decorator';
import { tokenEnum } from 'src/common/enums';
import { getSocketAuth } from 'src/utils/security/socket';
import { TokenService } from 'src/utils/security/token.security';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokensService: TokenService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenType: tokenEnum =
      this.reflector.getAllAndOverride<tokenEnum>(tokenName, [
        context.getHandler(),
        context.getClass(),
      ]) ?? tokenEnum.access;

    // console.log({ context, tokenType });

    let req: any;
    let authorization: string = '';
    switch (context.getType<string>()) {
      case 'http':
        const httpCtx = context.switchToHttp();
        req = httpCtx.getRequest();
        authorization = req.headers.authorization;
        break;

      case 'ws':
        const ws_Ctx = context.switchToWs();
        req = ws_Ctx.getClient();
        authorization = getSocketAuth(req);
        console.log(req);
        break;

      case 'graphql':
        req = GqlExecutionContext.create(context).getContext().req;
        authorization = req.headers.authorization;
        break;
      default:
        break;
    }

    if (!authorization) {
      return false;
    }

    const { user, decoded } = await this.tokensService.decodeToken({
      authorization,
      tokenType,
    });

    req.credentials = { user, decoded };
    req.user = user;
    req.decoded = decoded;
    return true;
  }
}
