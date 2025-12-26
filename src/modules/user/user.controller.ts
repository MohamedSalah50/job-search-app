import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleEnum, User, type IAuthRequest } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';
import type { UserDocument } from 'src/db';
import { Types } from 'mongoose';
import { UpdatePasswordDto } from './dto/updatePassword.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @auth([RoleEnum.user , RoleEnum.admin])
  @Get("/profile")
  profile(@Req() req: IAuthRequest): { message: string } {
    return { message: "done" }
  }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Patch("/update-basic-profile")
  async updateBasicProfile(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, stopAtFirstError: true }))
  dto: UpdateUserDto, @Req() req: IAuthRequest): Promise<{ message: string }> {
    await this.userService.updateBasicProfile(dto, req);
    return { message: "done" }
  }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Get("/get-login-user-account-data")
  async getLoginUserAccountData(@Req() req: IAuthRequest) {
    const user = await this.userService.getLoginUserAccountData(req);
    return user
  }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Get("/profile/:userId")
  async getAnotherUserProfile(@Req() req: IAuthRequest, @Param("userId") userId: Types.ObjectId) {
    const anotherProfile = await this.userService.getAnotherUserProfile(req, userId);
    return anotherProfile
  }

  @auth([RoleEnum.user, RoleEnum.admin])
  @Patch("/update-password")
  async updatePassword(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, stopAtFirstError: true }))
    dto: UpdatePasswordDto, @Req() req: IAuthRequest): Promise<{ message: string }> {
    await this.userService.updatePassword(req, dto);
    return { message: "password updated, please login again" }
  }


  @auth([RoleEnum.user, RoleEnum.admin])
  @Patch("freeze-account")
  async freeze(
    @Req() req: IAuthRequest, @Body("userId") userId?: Types.ObjectId): Promise<{ message: string }> {
    await this.userService.freeze(req, userId);
    return { message: "user archived successfully" }
  }
}
