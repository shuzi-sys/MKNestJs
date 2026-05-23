import { Delete, Get, HttpCode, Patch, Post, Request, UseGuards, Body, Param } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './comment.dto/create-comment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateCommentDto } from './comment.dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
    constructor(private commentsService: CommentsService){}
        

@Get(':id')
@HttpCode(200)
getCommentById(@Param('id') id:string){
    return this.commentsService.getById(+id)
}

@Patch(':id')
@UseGuards(AuthGuard)
updateComment(@Param('id') id: string, @Request() req, @Body() updateCommentDto: UpdateCommentDto){
    return this.commentsService.update(+id, req.user.userId, updateCommentDto)
}

@Delete(':id')
@UseGuards(AuthGuard)
@HttpCode(204)
async removeComment(@Param('id') id:string, @Request() req){
    await this.commentsService.remove(+id, req.user.userId)
}

}
