import { Types } from "mongoose";


export interface IMessage{
    _id?:Types.ObjectId,
    senderId:Types.ObjectId,
    receiverId:Types.ObjectId,
    message:string,
    seenAt:Date,
    deletedAt:Date
    updatedAt?:Date
    createdAt?:Date
}