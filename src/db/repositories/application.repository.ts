import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { Application, ApplicationDocument as TDocument } from "../models";


@Injectable()
export class ApplicationRepository extends DatabaseRepository<Application> {
    constructor(
        @InjectModel(Application.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}