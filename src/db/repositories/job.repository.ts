import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { Job, JobDocument as TDocument } from "../models";


@Injectable()
export class JobRepository extends DatabaseRepository<Job> {
    constructor(
        @InjectModel(Job.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}