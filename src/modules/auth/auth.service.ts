import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { signupDto } from './dto/signup.dto';
import { OtpRepository, type UserDocument, UserRepository } from 'src/db';
import { Types } from 'mongoose';
import { compareHash, generateHash, generateOtp } from 'src/utils';
import { IAuthRequest, OtpEnum, ProviderEnum } from 'src/common';
import { resendConfirmEmailDto } from './dto/resendConfirmEmail.dto';
import { ConfirmEmailDto } from './dto/confirmEmailDto.dto';
import { LoginDto } from './dto/login.dto';
import { TokenService } from 'src/utils/security/token.security';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Request, Response } from 'express';
import { LoginWithGmailDto } from './dto/LoginWithGmail.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly tokenService: TokenService,
  ) {}

  private async verifyGmailAccount(idToken: string): Promise<TokenPayload> {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_IDS?.split(',') || [],
    });
    const payload = ticket.getPayload();

    if (!payload?.email_verified) {
      throw new BadRequestException('fail to  verify this account');
    }

    return payload;
  }

  async LoginWithGmail(req: Request, res: Response, dto: LoginWithGmailDto) {
    const { idToken } = dto;
    const { email } = await this.verifyGmailAccount(idToken);

    const user = await this.userRepository.findOne({ filter: { email } });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const credentials = await this.tokenService.createLoginCredentials(
      user as UserDocument,
    );

    return credentials;
  }

  async signUpWithGmail(req: Request, res: Response, dto: LoginWithGmailDto) {
    const { idToken } = dto;

    const { family_name, given_name, email, picture } =
      await this.verifyGmailAccount(idToken);

    const user = await this.userRepository.findOne({ filter: { email } });

    if (user) {
      if (user.provider === ProviderEnum.google) {
        await this.LoginWithGmail(req, res, dto);
      }
      throw new ConflictException(
        `user already exist with another provider  ${user.provider}`,
      );
    }

    const [newUser] =
      (await this.userRepository.create({
        data: [
          {
            email,
            userName: `${given_name} ${family_name}`,
            firstName: given_name,
            lastName: family_name,
            // profilePic:picture,
            isConfirmed: true,
          },
        ],
      })) || [];

    if (!newUser)
      throw new BadRequestException(
        'fail to signup this user, please try again later',
      );

    const credentials = await this.tokenService.createLoginCredentials(
      newUser as UserDocument,
    );

    return credentials;
  }

  private async createConfirmEmailOtp(userId: Types.ObjectId) {
    await this.otpRepository.create({
      data: [
        {
          code: generateOtp(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          createdBy: userId,
          type: OtpEnum.confirmEmail,
        },
      ],
    });
  }

  private async createForgotPasswordOtp(userId: Types.ObjectId) {
    await this.otpRepository.create({
      data: [
        {
          code: generateOtp(),
          expiresAt: new Date(Date.now() + 3 * 60 * 1000),
          createdBy: userId,
          type: OtpEnum.forgotPassword,
        },
      ],
    });
  }

  async signup(dto: signupDto): Promise<{ message: string }> {
    const { userName, email, password, DOB, mobileNumber } = dto;

    const existingUser = await this.userRepository.findOne({
      filter: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const [user] =
      (await this.userRepository.create({
        data: [
          {
            userName,
            email,
            password,
            DOB,
            mobileNumber,
          },
        ],
      })) || [];

    if (!user)
      throw new BadRequestException(
        'fail to signup this user, please try again later',
      );

    await this.createConfirmEmailOtp(user._id);

    return {
      message: 'signup successfull , please check your email for verification',
    };
  }

  async resendConfirmEmailOtp(dto: resendConfirmEmailDto) {
    const { email } = dto;

    const user = await this.userRepository.findOne({
      filter: { email, isConfirmed: false },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.confirmEmail } }],
      },
    });

    if (!user) {
      throw new BadRequestException('user not found');
    }

    if (user.otp?.length) {
      throw new ConflictException(
        `sorry we cant resend email, please wait ${user.otp[0].expiresAt.toLocaleString()} to resend`,
      );
    }

    await this.createConfirmEmailOtp(user._id);

    return 'email resent successfully';
  }

  async confirmEmail(dto: ConfirmEmailDto): Promise<{ message: string }> {
    const { email, otp } = dto;

    const user = await this.userRepository.findOne({
      filter: { email, isConfirmed: false },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.confirmEmail } }],
      },
    });

    if (!user) {
      throw new BadRequestException('user not found');
    }

    if (!(user.otp?.length && (await compareHash(otp, user.otp[0].code)))) {
      throw new BadRequestException('invalid otp');
    }

    await this.userRepository.updateOne({
      filter: { email },
      update: { isConfirmed: true },
    });

    await this.otpRepository.deleteOne({
      filter: { _id: user.otp[0]._id },
    });

    return { message: 'email confirmed successfully' };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.userRepository.findOne({
      filter: { email, isConfirmed: true, provider: ProviderEnum.system },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (!(await compareHash(password, user.password))) {
      throw new BadRequestException('invalid email or password');
    }

    return await this.tokenService.createLoginCredentials(user as UserDocument);
  }

  async sendForgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.userRepository.findOne({
      filter: { email, isConfirmed: true, provider: ProviderEnum.system },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.forgotPassword } }],
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (user.otp?.length) {
      throw new ConflictException(
        `sorry we cant resend email, please wait ${user.otp[0].expiresAt.toLocaleString()} to resend`,
      );
    }

    await this.createForgotPasswordOtp(user._id);

    return { message: 'email resent successfully' };
  }

  async resetForgotPassword(dto: ResetPasswordDto) {
    const { email, otp, password } = dto;

    const user = await this.userRepository.findOne({
      filter: { email, isConfirmed: true, provider: ProviderEnum.system },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.forgotPassword } }],
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (!(user.otp?.length && (await compareHash(otp, user.otp[0].code)))) {
      throw new BadRequestException('invalid otp');
    }

    await this.userRepository.updateOne({
      filter: { email },
      update: {
        password: await generateHash(password),
        changeCredentialTime: new Date(),
      },
    });

    await this.otpRepository.deleteOne({
      filter: { _id: user.otp[0]._id },
    });
    return { message: 'password updated successfully , please login again' };
  }

  async refreshToken(req: IAuthRequest) {
    const credentials = await this.tokenService.createLoginCredentials(
      req.user,
    );
    await this.tokenService.revokeToken(req.decoded);
    return credentials;
  }
}
