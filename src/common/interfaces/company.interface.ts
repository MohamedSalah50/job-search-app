import { Types } from "mongoose"
import { IUser } from "./user.interface";
import { numberOfEmployeesEnum } from "../enums";


export interface IMedia {
    secure_url: string;
    public_id: string;
}

export interface ICompany {
    _id?: Types.ObjectId

    companyName: string;
    description: string;
    industry: string;
    address: string;
    numberOfEmployees: numberOfEmployeesEnum;
    companyEmail: string;
    createdBy: Types.ObjectId;
    logo?: IMedia;
    coverPic?: IMedia;
    Hrs: Types.ObjectId[] | IUser[];
    bannedAt?: Date;
    deletedAt?: Date;
    legalAttachments?: IMedia;
    approvedByAdmin: boolean;

}