import { Role } from "@prisma/client";
import { IsEnum, IsInt, IsNotEmpty, Max, Min } from "class-validator";

export class ReviewsDto {
  
  @IsNotEmpty()
  @Min(1)
  @Max(10)
  score!: number

  @IsNotEmpty()
  @IsEnum(Role)
  role!: Role

  @IsNotEmpty()
  @IsInt()
  transactionId!: number

  @IsNotEmpty()
  @IsInt()
  reviewerId!: number
  
  @IsNotEmpty()
  @IsInt()
  reviewedId!: number

}
