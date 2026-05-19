import { IsDate, IsNotEmpty, MaxLength, IsOptional, IsInt, IsString } from "class-validator";
export class CommentDto {
    

    @IsOptional()
    @IsInt()
    parentCommentId?: number

    @IsNotEmpty()
    @IsInt()
    ownerid!: number

    @IsNotEmpty()
    @IsString()
    @MaxLength(2500)
    content!: string

    @IsNotEmpty()
    @IsInt()
    parentPostId!: number

}