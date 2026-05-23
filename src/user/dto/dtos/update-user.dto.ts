import { PartialType, OmitType } from '@nestjs/mapped-types'

import { UserDto } from './user.dto'

export class UpdateUserDto extends PartialType(OmitType(UserDto, ['password'] as const)){}

