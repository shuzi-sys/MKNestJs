import { IsInt, IsNotEmpty, IsOptional } from "class-validator"

export class StatsDto {

    @IsInt()
    @IsNotEmpty()
    userId!: number

    @IsInt()
    @IsOptional()
    buyerReputation?: number

    @IsInt()
    @IsOptional()
    sellerReputation?: number
}

