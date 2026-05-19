import { IsString, MinLength, IsNotEmpty } from "class-validator"

export class PasswordUserDto {
    @IsString()
    @IsNotEmpty()
    oldpassword!: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    newpassword!: string;
}
