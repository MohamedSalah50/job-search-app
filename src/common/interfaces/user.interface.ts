import { Types } from "mongoose"
import { genderEnum, ProviderEnum, RoleEnum } from "../enums"
import { OtpDocument } from "src/db"
import { IMedia } from "./company.interface"


export interface IUser {
    _id?: Types.ObjectId
    firstName: string
    lastName: string
    userName?: string

    email: string
    password: string

    provider: ProviderEnum
    gender: genderEnum
    role: RoleEnum

    DOB: Date
    mobileNumber?: string
    isConfirmed?: boolean
    deletedAt?: Date
    bannedAt?: Date
    updatedBy?: Types.ObjectId

    changeCredentialTime?: Date
    profilePic: IMedia
    coverPic: IMedia
    otp?: OtpDocument[]

    restoredAt?: Date;
    freezedAt?: Date;

}