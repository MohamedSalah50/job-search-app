import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { genderEnum, IUser, ProviderEnum, RoleEnum } from 'src/common';
import { decryptEncryption, generateEncryption, generateHash } from 'src/utils';
import { OtpDocument } from './otp.model';
import { Media } from './company.model';

export type UserDocument = HydratedDocument<User> & {
  actualMobileNumber?: string | null;
};
@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User implements IUser {
  @Prop({ required: true, minlength: 2, maxlength: 20 })
  firstName: string;
  @Prop({ required: true, minlength: 2, maxlength: 20 })
  lastName: string;
  @Virtual({
    get: function (this: User) {
      return this.firstName + ' ' + this.lastName;
    },
    set: function (value: string) {
      const [firstName, lastName] = value.split(' ');
      this.set({ firstName, lastName });
    },
  })
  userName: string;
  @Prop({ unique: true, required: true })
  email: string;
  @Prop({
    required: function () {
      return this.provider === 'system' ? true : false;
    },
  })
  password: string;

  @Prop({ type: String, enum: ProviderEnum, default: 'system' })
  provider: ProviderEnum;
  @Prop({ type: String, enum: genderEnum, default: genderEnum.male })
  gender: genderEnum;
  @Prop({ type: String, enum: RoleEnum, default: RoleEnum.user })
  role: RoleEnum;

  @Prop({ type: Date, required: true })
  DOB: Date;
  @Prop({ type: String, required: false })
  mobileNumber: string;

  @Prop({ type: Boolean, default: false })
  isConfirmed: boolean;
  @Prop({ type: Date })
  deletedAt: Date;
  @Prop({ type: Date })
  bannedAt: Date;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
  @Prop({ type: Date })
  changeCredentialTime: Date;
  @Prop({ type: Media, default: null })
  profilePic: Media;
  @Prop({ type: Media, default: null })
  coverPic: Media;
  @Virtual()
  otp: OtpDocument[];

  @Prop({ type: Date })
  restoredAt?: Date;
  @Prop({ type: Date })
  freezedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await generateHash(this.password);
  }
  next();
});

UserSchema.post('findOne', async function (doc: any) {
  if (doc && doc.mobileNumber) {
    try {
      doc.actualMobileNumber = await decryptEncryption({
        cipherText: doc.mobileNumber,
      });
    } catch (error) {
      console.error('Decryption error in post hook:', error);
      doc.actualMobileNumber = null;
    }
  }
});

UserSchema.pre('save', async function (next) {
  if (this.isModified('mobileNumber') && this.mobileNumber) {
    this.mobileNumber = await generateEncryption({
      plainText: this.mobileNumber,
    });
  }
  next();
});

UserSchema.virtual('otp', {
  localField: '_id',
  foreignField: 'createdBy',
  ref: 'Otp',
});

export const UserModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: UserSchema,
  },
]);

export const ConnectedSockets = new Map<string,string[]>();
