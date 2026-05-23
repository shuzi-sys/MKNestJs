import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './post.dto/create-post.dto';
import { UpdatePostDto } from './post.dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Messages } from 'src/error-messages/error-messages'
import { PostStatus } from '@prisma/client';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService){}

    // Función de validación para ver evitar manipulacion sin permiso
    private async postOwnershipValidation(postid: number, userid: number){
        const [post, user] = await Promise.all([
            this.prisma.post.findUnique({where: {id:postid}}),
            this.prisma.user.findUnique({where: {id:userid}, select:{isAdmin:true}})
        ])
            if (!post) throw new NotFoundException(Messages.posts.notFound)
            if (!user) throw new ForbiddenException(Messages.lackOfCredentials)
            if (userid != post.ownerId && !user.isAdmin) throw new ForbiddenException(Messages.posts.forbidden)
    }
    //

    /* si esto fuese un proyecto real deberia haber un get que se adapte al algoritmo de busqueda
    el cual trabaja segun las preferencias del usuario, descuentos actuales, hot sales y demas, y 
    que use paginacion con un indice calculado despues de cada get asi podes ir "explorando"*/

    async getByUserId(userId: number){
        return await this.prisma.post.findMany({where:{ownerId:userId}})
    }
    async getByPostId(postId: number){
            const post = await this.prisma.post.findUnique({where:{id:postId}, include: {comments:true}})
            if (!post) throw new NotFoundException(Messages.posts.notFound)
            return post
    }

    async create(userId: number, createPostDto: CreatePostDto){
        return this.prisma.post.create({
            data:{
                title: createPostDto.title,
                description: createPostDto.description,
                price: createPostDto.price,
                status: createPostDto.status,
                ownerId: userId
            }}
        )
    }

    // Si el amount llega a 0, el post se pausa.
    async update(postId: number, userId: number, updatePostDto: UpdatePostDto){
        await this.postOwnershipValidation(postId, userId)
        const shouldPause = updatePostDto.amount !== undefined && updatePostDto.amount <= 0

        return this.prisma.post.update({
        where: { id: postId },
        data: {
        ...updatePostDto,
        ...(shouldPause && { status: PostStatus.PAUSED })}})
    }


    async remove(postId: number, userId: number){
        await this.postOwnershipValidation(postId, userId)
        await this.prisma.post.delete({where: {id:postId}})
    }
}
