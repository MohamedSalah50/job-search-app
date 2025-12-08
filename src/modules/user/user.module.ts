import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TokenService } from 'src/utils/security/token.security';
import { TokenModel, TokenRepository, UserModel, UserRepository } from 'src/db';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TokenModel, UserModel, TokenModel],
  controllers: [UserController],
  providers: [UserService, TokenService, JwtService, UserRepository, TokenRepository],
})
export class UserModule { }
