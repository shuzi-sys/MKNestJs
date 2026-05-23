import { IsDate, IsNotEmpty, MaxLength, IsOptional, IsInt, IsString } from "class-validator";
export class CommentDto {
    

    @IsOptional()
    @IsInt()
    parentCommentId?: number

    @IsNotEmpty()
    @IsString()
    @MaxLength(2500)
    content!: string

}