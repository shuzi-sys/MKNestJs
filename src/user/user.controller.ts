import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/dtos/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDto } from './dto/dtos/update-user.dto';
import { CommentsService } from 'src/comments/comments.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { PasswordUserDto } from './dto/dtos/password-user.dto';
import { ReviewsService } from 'src/reviews/reviews.service';

@Controller('user')
export class UserController {
constructor(private readonly userService: UserService,
            private readonly commentService: CommentsService,
            private readonly transactionsService: TransactionsService,
            private readonly reviewsService: ReviewsService
){}



    

@Post()
@HttpCode(201)
createUser(@Body() createUserDto: CreateUserDto){
    return this.userService.create(createUserDto)
}


@Get(':id')
@HttpCode(200)
getUserProfileById(@Param('id') id:string){
    return this.userService.getUserProfileById(+id)
}

//Reconozco que no deberia tener logica de switch en el controller, pero esto lo hice con 4hrs de sueño
@Get(':id/transactions')
@UseGuards(AuthGuard)
getByUserId(@Request() req, @Query('role') role? : 'buyer' | 'seller'){
    return this.transactionsService.getByUserIdWithRole(req.user.userId, role)

}

@Get(':id/comments')
@HttpCode(200)
@UseGuards(AuthGuard)
getUserComments(@Param('id') id:string, @Request() req){
    return this.commentService.getByUserId(req.user.userId, +id)
}

@Get(':id/reviews')
    @HttpCode(200)
    getByUserIdWithRole(@Param('id') id:string, @Query('role') role: 'buyer' | 'seller'){
        return this.reviewsService.getByUserIdWithRole(+id, role)
    }

@Patch(':id')
@HttpCode(200)
@UseGuards(AuthGuard)
updateUser(@Param('id') id: string, @Request() req, @Body() updateUserDto: UpdateUserDto){
return this.userService.update(req.user.userId ,+id, updateUserDto)
}

@Patch(':id/password')
@HttpCode(200)
@UseGuards(AuthGuard)
updateUserPassword(@Param('id') id: string, @Request() req, @Body() passwordUserDto: PasswordUserDto){
return this.userService.updatePassword(req.user.userId ,+id, passwordUserDto)
}

@Delete(':id')
@HttpCode(204)
@UseGuards(AuthGuard)
async remove(@Param('id') id:string, @Request() req){
//console.log(req.user.userId)
await this.userService.remove(req.user.userId, +id)
}
}
/*
@Patch(':id')
@UseGuards(JwtAuthGuard)
*/