import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { Company , CompanyDocument as TDocument } from "../models";


@Injectable()
export class CompanyRepository extends DatabaseRepository<Company> {
    constructor(
        @InjectModel(Company.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}