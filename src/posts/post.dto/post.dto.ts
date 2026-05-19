import { PostStatus } from "@prisma/client"
import { IsEnum, IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class PostDto {
    
    @IsNotEmpty()
    @IsString()
    @MaxLength(70)
    title!: string

    @IsNotEmpty()
    @IsString()
    description!: string

    @IsInt()
    @IsNotEmpty()
    price!: number

    @IsEnum(PostStatus)
    status!: PostStatus

}
