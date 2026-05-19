import {IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator'

export class UserDto {
@IsString()
@IsNotEmpty()
@MaxLength(30)
username!: string;


@IsEmail()
@IsNotEmpty()
email!: string;

@IsString()
@MinLength(8)
@MaxLength(50)
@IsNotEmpty()
password!: string

}
