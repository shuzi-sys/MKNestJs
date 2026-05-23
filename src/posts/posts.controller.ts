import { Delete, Get, HttpCode, Patch, Post, Request, UseGuards, Body, Param } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './post.dto/create-post.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdatePostDto } from './post.dto/update-post.dto';
import { TransactionsService } from 'src/transactions/transactions.service';
import { CreateTransactionsDto } from 'src/transactions/transactions.dto/create-transactions.dto';
import { CommentsService } from 'src/comments/comments.service';
import { CreateCommentDto } from 'src/comments/comment.dto/create-comment.dto';

@Controller('posts')
export class PostsController {
    constructor(private postsService: PostsService,
                private transactionsService: TransactionsService,
                private commentsService: CommentsService
    ){}

    
        
    
    @Post()
    @HttpCode(201)
    @UseGuards(AuthGuard)
    createPost(@Body() createPostDto: CreatePostDto, @Request() req){
        return this.postsService.create(req.user.userId, createPostDto)
    }
    
    @Post(':id/transactions')
    @HttpCode(201)
    @UseGuards(AuthGuard)
    createTransaction( @Request() req, @Param('id') postId: string,@Body() createTransactionsDto: CreateTransactionsDto){
    return this.transactionsService.create(req.user.userId, +postId, createTransactionsDto)
    }

    @Post(':id/comments')
    @HttpCode(201)
    @UseGuards(AuthGuard)
    createComment(@Body() createCommentDto: CreateCommentDto,@Param('id') id: string, @Request() req){
    return this.commentsService.create(req.user.userId, +id, createCommentDto)
    }

    @Get(':id')
    @HttpCode(200)
    getPostById(@Param('id') id:string){
        return this.postsService.getByPostId(+id)
    }
    
    @Patch(':id')
    @HttpCode(204)
    @UseGuards(AuthGuard)
    updatePost(@Param('id') id: string, @Request() req, @Body() updatePostDto: UpdatePostDto){
    return this.postsService.update(+id ,req.user.userId, updatePostDto)
    }
    
    @Delete(':id')
    @HttpCode(204)
    @UseGuards(AuthGuard)
    removePost(@Param('id') id:string, @Request() req){
        return this.postsService.remove(+id, req.user.userId)
    }
}
