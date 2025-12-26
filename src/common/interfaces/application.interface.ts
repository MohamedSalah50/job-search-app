import { Types } from "mongoose"
import { ApplicationStatusEnum } from "../enums";
import { IUser } from "./user.interface";
import { IJob } from "./job.interface";
import { IMedia } from "./company.interface";

export interface IApplication {
    _id?: Types.ObjectId;
    jobId: Types.ObjectId | IJob;
    userId: Types.ObjectId | IUser;
    userCv?: IMedia;
    status: ApplicationStatusEnum;

    createdAt?: Date;
    updatedAt?: Date;
}