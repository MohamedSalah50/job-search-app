import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TokenRepository, UserDocument, UserRepository } from 'src/db';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService, IAuthRequest, RoleEnum } from 'src/common';
import { compareHash, generateEncryption, generateHash } from 'src/utils';
import { isValidObjectId, Types } from 'mongoose';
import { UpdatePasswordDto } from './dto/updatePassword.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async updateBasicProfile(
    dto: UpdateUserDto,
    req: IAuthRequest,
  ): Promise<{ message: string }> {
    const { firstName, lastName, gender, DOB, mobileNumber } = dto;

    const updateData: any = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (gender) updateData.gender = gender;
    if (DOB) updateData.DOB = DOB;
    if (mobileNumber) {
      updateData.mobileNumber = await generateEncryption({
        plainText: mobileNumber,
      });
    }

    const updatedUser = await this.userRepository.updateOne({
      filter: { _id: req.user._id },
      update: updateData,
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Profile updated successfully' };
  }

  async getLoginUserAccountData(req: IAuthRequest) {
    const user = (await this.userRepository.findOne({
      filter: { _id: req.user._id, freezedAt: { $exists: false } },
    })) as UserDocument;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.actualMobileNumber,
      gender: user.gender,
      DOB: user.DOB,
      // profilePic: user.profilePic,
      // coverPic: user.coverPic,
      role: user.role,
    };
  }

  async getAnotherUserProfile(req: IAuthRequest, userId: Types.ObjectId) {
    if (!isValidObjectId(userId))
      throw new NotFoundException('invalid user id');

    const user = (await this.userRepository.findOne({
      filter: { _id: userId, freezedAt: { $exists: false } },
    })) as UserDocument;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
      throw new BadRequestException('use /profile to get your own data');
    }

    if (user.bannedAt || user.deletedAt) {
      throw new BadRequestException('user is banned or deleted');
    }

    return {
      userName: user.userName,
      mobileNumber: user.actualMobileNumber,
      // profilePic: user.profilePic,
      // coverPic: user.coverPic,
    };
  }

  async updatePassword(
    req: IAuthRequest,
    dto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = dto;

    if (oldPassword === newPassword)
      throw new BadRequestException(
        'old password and new password should be different',
      );

    const user = await this.userRepository.findOne({
      filter: { _id: req.user._id },
    });

    if (!user) throw new NotFoundException('user not found');

    if (!(await compareHash(oldPassword, user.password))) {
      throw new BadRequestException('invalid old password');
    }

    await this.userRepository.updateOne({
      filter: { _id: req.user._id },
      update: {
        password: await generateHash(newPassword),
        changeCredentialTime: new Date(),
      },
    });

    return { message: 'password updated successfully , please login again' };
  }

  async freeze(
    req: IAuthRequest,
    userId?: Types.ObjectId,
  ): Promise<{ message: string }> {
    const targetId =
      req.user.role === RoleEnum.admin ? userId || req.user._id : req.user._id;

    // const normalizedId = targetId.toString();

    const user = await this.userRepository.updateOne({
      filter: {
        _id: targetId,
        freezedAt: { $exists: false },
      },
      update: {
        changeCredentialTime: new Date(),
        freezedAt: new Date(),
      },
    });

    if (!user.matchedCount) throw new NotFoundException('user not found');

    return { message: 'user archived successfully' };
  }

  async updateProfilePic(
    userId: Types.ObjectId,
    uploadResult: { secure_url: string; public_id: string },
  ) {
    // Get user
    const user = await this.userRepository.findOne({
      filter: { _id: userId },
    });

    if (!user) throw new NotFoundException('user not found');

    // Delete old profile pic if exists
    if (user.profilePic?.public_id) {
      await this.cloudinaryService.destroyFile(user.profilePic.public_id);
    }

    // Update with new pic
    await this.userRepository.updateOne({
      filter: { _id: userId },
      update: {
        profilePic: {
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        },
      },
    });

    return {
      message: 'Profile picture uploaded successfully',
      profilePic: uploadResult,
    };
  }

  async deleteProfilePic(userId: Types.ObjectId) {
    const user = await this.userRepository.findOne({
      filter: { _id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.profilePic?.public_id) {
      throw new BadRequestException('No profile picture to delete');
    }

    // Delete from Cloudinary
    await this.cloudinaryService.destroyFile(user.profilePic.public_id);

    // Remove from DB
    await this.userRepository.updateOne({
      filter: { _id: userId },
      update: { profilePic: null },
    });

    return { message: 'Profile picture deleted successfully' };
  }
}
