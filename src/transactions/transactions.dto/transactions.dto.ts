import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from "class-validator"
//import { TransactionStatus } from "./transactions.enum"
import { TransactionStatus } from '@prisma/client';

export class TransactionsDto {
    
    @IsEnum(TransactionStatus)
    status!: TransactionStatus

    @IsNotEmpty()
    @IsString()
    reason!: string
    
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    amount!: number

    @IsNotEmpty()
    @IsInt()
    value!: number

    @IsNotEmpty()
    @IsInt()
    buyerId!: number

    @IsNotEmpty()
    @IsInt()
    sellerId!: number

    @IsNotEmpty()
    @IsInt()
    postId!: number
}