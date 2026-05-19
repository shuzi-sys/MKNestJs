import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
    if (!comment){
        throw new NotFoundException(Messages.comments.notFound)
    }
    if (userid != comment.ownerId && user!.isAdmin != true){
        throw new ForbiddenException(Messages.comments.forbidden)
    }

    return;
}
//

async create(userId: number, createCommentDto: CreateCommentDto){
return this.prisma.comment.create({
    data: {
        ownerId: userId,
        content: createCommentDto.content!,
        parentPostId: createCommentDto.parentPostId!,
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

async delete(commentid: number, userid: number){
    await this.commentOwnershipValidation(commentid, userid);
    await this.prisma.comment.delete({where: {id: commentid}})
    return;
}
}