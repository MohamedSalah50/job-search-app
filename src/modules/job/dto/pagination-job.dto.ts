import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page must be at least 1' })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be at least 1' })
    @Max(100, { message: 'Limit must not exceed 100' })
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sort?: string = 'createdAt';

    @IsOptional()
    @IsEnum(SortOrder, { message: `Sort order must be ${Object.values(SortOrder)} ` })
    sortOrder?: SortOrder = SortOrder.DESC;
}