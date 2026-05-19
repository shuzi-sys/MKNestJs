import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/dtos/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/dtos/update-user.dto';
import { Messages } from 'src/error-messages/error-messages';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService){}
private async userOwnershipValidation(selfuserId: number, userId: number){
        const[selfuser, user] = await Promise.all([
        this.prisma.user.findUnique({where: {id:selfuserId}, select: {isAdmin:true}}),
        this.prisma.user.findUnique({where: {id:userId}})])
    if (!selfuser)
    { 
        return new ForbiddenException(Messages.lackOfCredentials)
    }
    if (!user)
    {
        return new NotFoundException(Messages.user.notFound)
    }
if (selfuserId != userId && selfuser.isAdmin != true)
    {
        return new ForbiddenException(Messages.user.forbidden)
    }
}
    
// quizas?
async getByUserId(userId: number){
    return this.prisma.user.findUnique({where:{id:userId}})
}

async create(createUserDto: CreateUserDto){
    const PassHash = await bcrypt.hash(createUserDto.password!, 10)
    return this.prisma.user.create({
        data: {
            username: createUserDto.username!,
            email: createUserDto.email!,
            password: PassHash
        }})
}

async update(selfuserId: number, userId: number, updateUserDto: UpdateUserDto){
await this.userOwnershipValidation(selfuserId, userId)
return this.prisma.user.update({where: {id:userId}, data: updateUserDto})
}

async delete(selfuserId: number, userId: number){
await this.userOwnershipValidation(selfuserId, userId)
await this.prisma.user.delete({where: {id:userId}})
}

}

