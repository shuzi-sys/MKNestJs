import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/dtos/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/dtos/update-user.dto';
import { Messages } from 'src/error-messages/error-messages';
import { Prisma } from 'generated/prisma/browser';
import { PasswordUserDto } from './dto/dtos/password-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService){}

    /* Aca solo traigo el ID del usuario para optimizar la query, solo quiero saber si el user existe y
    tengo entendido que este orm no tiene un .exists() */
    private async userOwnershipValidation(selfuserId: number, userId: number){   
    const[selfuser, user] = await Promise.all([
        this.prisma.user.findUnique({where: {id:selfuserId}, select: {isAdmin:true}}),
        this.prisma.user.findUnique({where: {id:userId}, select: {id:true}})])
    if (!selfuser)
    { 
        throw new ForbiddenException(Messages.lackOfCredentials)
    }
    if (!user)
    {
        throw new NotFoundException(Messages.user.notFound)
    }
    if (selfuserId != userId && selfuser.isAdmin != true)
    {
        throw new ForbiddenException(Messages.user.forbidden)
    }
}
    
async getUserProfileById(userId: number){
    const user = await this.prisma.user.findUnique({
        where:{id:userId}, 
        select:{ 
            username: true, createdAt:true,
            posts:{
                select: {title:true,status:true}
            },
            stats:{
                select: {buyerReputation:true, sellerReputation:true}
            }
    }})
    if (!user) {throw new NotFoundException(Messages.user.notFound)}
    return user
}

// Usado en el authservice
async getByUsername(username: string){
    return this.prisma.user.findFirst({where:{username:username}})
}


async create(createUserDto: CreateUserDto){
    const PassHash = await bcrypt.hash(createUserDto.password!, 10)
    return this.prisma.user.create({
        data: {
            username: createUserDto.username,
            email: createUserDto.email,
            password: PassHash,
            stats: {
                create: {}
            }
        },
        omit:{
            password:true
        }})
}

async update(selfuserId: number, userId: number, updateUserDto: UpdateUserDto){
await this.userOwnershipValidation(selfuserId, userId)
return this.prisma.user.update({where: {id:userId}, data: updateUserDto, omit: {password:true}})
}

async updatePassword(selfuserId: number, userId: number, passwordUserDto: PasswordUserDto){
await this.userOwnershipValidation(selfuserId, userId)

//Cambio de pass normal
if (selfuserId === userId) {
    const user = await this.prisma.user.findUnique({ where: { id:userId }, select:{isAdmin:true, password:true} })
    if (!user) { throw new NotFoundException(Messages.user.notFound) }
    const isValid = await bcrypt.compare(passwordUserDto.oldpassword, user.password)
    if (!isValid) throw new ForbiddenException(Messages.user.forbidden)
  }
//Cambio por tercero (admin)
  const hashed = await bcrypt.hash(passwordUserDto.newpassword, 10)
  return this.prisma.user.update({
    where: { id:userId },
    data: { password: hashed },
    omit: { password: true }
  })
}


async remove(selfuserId: number, userId: number){
await this.userOwnershipValidation(selfuserId, userId)
await this.prisma.user.delete({where: {id:userId}})
}

}

