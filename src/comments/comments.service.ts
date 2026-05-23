import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './comment.dto/create-comment.dto';
import { UpdateCommentDto } from './comment.dto/update-comment.dto';
import { Messages } from 'src/error-messages/error-messages'

@Injectable()
export class CommentsService {
constructor (private prisma: PrismaService){}

// Función de validación para ver evitar manipulacion sin permiso
private async commentOwnershipValidation(commentid: number, userid: number){
        const[comment, user] = await Promise.all([
        this.prisma.comment.findUnique({where: {id:commentid}}),
        this.prisma.user.findUnique({where: {id: userid}, select:{isAdmin:true}})
    ])
    if (!comment) throw new NotFoundException(Messages.comments.notFound)
    if (!user) throw new ForbiddenException(Messages.lackOfCredentials)
    if (userid != comment.ownerId && !user.isAdmin) throw new ForbiddenException(Messages.comments.forbidden)

    return;
}
//

// para mas privacidad, solo los admins pueden hacer esto.
async getByUserId(selfId: number, userId: number){
    if (selfId != userId){
    const self = await this.prisma.user.findUnique({where:{id:selfId}, select:{isAdmin:true}})
    if (!self) throw new ForbiddenException(Messages.lackOfCredentials)
    if (!self.isAdmin) throw new ForbiddenException(Messages.user.forbidden)
}
    return this.prisma.comment.findMany({where:{ownerId:userId}})
}

async getById(id: number){
    const comment = await this.prisma.comment.findUnique({where:{id}})
    if (!comment) throw new NotFoundException(Messages.comments.notFound)
    return comment
}


/*Este codigo es un poco sucio pero funciona más optimizado así para evitar querys en caso de que no
sea una respuesta a otro comment*/
async create(userId: number, postId: number, createCommentDto: CreateCommentDto){
    if (createCommentDto.parentCommentId != null){
        const comment = await this.prisma.comment.findUnique({where:{id:createCommentDto.parentCommentId}})
        if (comment!= null && comment.parentPostId == postId){
            return this.prisma.comment.create({
    data: {
        ownerId: userId,
        content: createCommentDto.content!,
        parentPostId: postId,
        parentCommentId: createCommentDto.parentCommentId
    }})}else {throw new BadRequestException(Messages.comments.parentNotFound) }
    }
    return this.prisma.comment.create({
    data: {
        ownerId: userId,
        content: createCommentDto.content!,
        parentPostId: postId,
        parentCommentId: createCommentDto.parentCommentId ?? null
    }
})
}

async update(commentid: number, userid: number, updateCommentDto: UpdateCommentDto){
    await this.commentOwnershipValidation(commentid, userid);
    return  this.prisma.comment.update({
        where: {id: commentid},
        data:{
            content: updateCommentDto.content
        }})
}

async remove(commentid: number, userid: number){
    await this.commentOwnershipValidation(commentid, userid);
    await this.prisma.comment.delete({where: {id: commentid}})
    return;
}
}