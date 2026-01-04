import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Req,
  ValidationPipe,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CloudinaryService,
  RoleEnum,
  UploadFile,
  type IAuthRequest,
} from 'src/common';

import { auth } from 'src/common/decorators/auth.decorator';
import { Types } from 'mongoose';
import { UpdatePasswordDto } from './dto/updatePassword.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @auth([RoleEnum.user, RoleEnum.admin])
  @Get('/profile')
  profile(@Req() req: IAuthRequest): { message: string } {
    return { message: 'done' };
  }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Patch('/update-basic-profile')
  async updateBasicProfile(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    )
    dto: UpdateUserDto,
    @Req() req: IAuthRequest,
  ): Promise<{ message: string }> {
    await this.userService.updateBasicProfile(dto, req);
    return { message: 'done' };
  }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Get('/get-login-user-account-data')
  async getLoginUserAccountData(@Req() req: IAuthRequest) {
    const user = await this.userService.getLoginUserAccountData(req);
    return user;
  }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Get('/profile/:userId')
  async getAnotherUserProfile(
    @Req() req: IAuthRequest,
    @Param('userId') userId: Types.ObjectId,
  ) {
    const anotherProfile = await this.userService.getAnotherUserProfile(
      req,
      userId,
    );
    return anotherProfile;
  }

  @auth([RoleEnum.user, RoleEnum.admin])
  @Patch('/update-password')
  async updatePassword(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    )
    dto: UpdatePasswordDto,
    @Req() req: IAuthRequest,
  ): Promise<{ message: string }> {
    await this.userService.updatePassword(req, dto);
    return { message: 'password updated, please login again' };
  }

  @auth([RoleEnum.user, RoleEnum.admin])
  @Patch('freeze-account')
  async freeze(
    @Req() req: IAuthRequest,
    @Body('userId') userId?: Types.ObjectId,
  ): Promise<{ message: string }> {
    await this.userService.freeze(req, userId);
    return { message: 'user archived successfully' };
  }

  @auth([RoleEnum.user, RoleEnum.admin])
  @Patch('profile-picture')
  @UploadFile('profilePic', 'image')
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: IAuthRequest,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    const uploadedResult = await this.cloudinaryService.uploadFile(
      file,
      'users/profile-pictures',
    );
    return this.userService.updateProfilePic(req.user._id, uploadedResult);
  }

  @Patch('profile-pic/delete')
  @auth([RoleEnum.user, RoleEnum.admin])
  async deleteProfilePic(@Req() req: IAuthRequest) {
    return this.userService.deleteProfilePic(req.user._id);
  }

  // @Patch('cover-pic')
  // @auth([RoleEnum.user, RoleEnum.admin])
  // @UploadFile('coverPic', 'image')
  // async uploadCoverPic(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Req() req: IAuthRequest,
  // ) {
  //   if (!file) {
  //     throw new BadRequestException('Cover picture is required');
  //   }

  //   const uploadResult = await this.cloudinaryService.uploadFile(
  //     file,
  //     'users/cover-pics',
  //   );

  //   return this.userService.updateCoverPic(req.user._id, uploadResult);
  // }

  // @Patch('cover-pic/delete')
  // @auth([RoleEnum.user, RoleEnum.admin])
  // async deleteCoverPic(@Req() req: IAuthRequest) {
  //   return this.userService.deleteCoverPic(req.user._id);
  // }}
}
