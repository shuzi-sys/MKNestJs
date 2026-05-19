import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './post.dto/create-post.dto';
import { UpdatePostDto } from './post.dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Messages } from 'src/error-messages/error-messages'

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService){}

    // Función de validación para ver evitar manipulacion sin permiso
    private async postOwnershipValidation(postid: number, userid: number){
        const [post, user] = await Promise.all([
            this.prisma.post.findUnique({where: {id:postid}}),
            this.prisma.user.findUnique({where: {id:userid}, select:{isAdmin:true}})
        ])
            if (!post){
                throw new NotFoundException(Messages.posts.notFound)
            }
            if (userid != post.ownerId && user!.isAdmin != true){
                throw new ForbiddenException(Messages.posts.forbidden)
            }
    }
    //
    async create(userId: number, createPostDto: CreatePostDto){
        return this.prisma.post.create({
            data:{
                title: createPostDto.title!,
                description: createPostDto.description!,
                price: createPostDto.price!,
                ownerId: userId
            }}
        )
    }

    async update(postId: number, userId: number, updatePostDto: UpdatePostDto){
        await this.postOwnershipValidation(postId, userId)
        return this.prisma.post.update({where: {id:postId}, data: updatePostDto})
    }
    async delete(postId: number, userId: number){
        await this.postOwnershipValidation(postId, userId)
        await this.prisma.post.delete({where: {id:postId}})
    }
}
