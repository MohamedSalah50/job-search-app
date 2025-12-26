import { Types } from "mongoose"
import { JobLocationEnum, SeniorityLevelEnum, WorkingTimeEnum } from "../enums";
import { IUser } from "./user.interface";

export interface IJob {
    _id?: Types.ObjectId;
    jobTitle: string;
    jobLocation: JobLocationEnum;
    workingTime: WorkingTimeEnum;
    seniorityLevel: SeniorityLevelEnum;
    jobDescription: string;
    technicalSkills: string[];
    softSkills: string[];
    addedBy: Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId | IUser;
    closed: boolean;
    companyId: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}