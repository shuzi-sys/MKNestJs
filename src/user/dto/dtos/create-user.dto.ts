import {IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { UserDto } from './user.dto'

export class CreateUserDto extends PartialType(UserDto) {}
