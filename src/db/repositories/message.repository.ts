import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { Message, MessageDocument as TDocument } from "../models";


@Injectable()
export class MessageRepository extends DatabaseRepository<Message> {
    constructor(
        @InjectModel(Message.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}