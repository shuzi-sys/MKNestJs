import { Delete, Get, HttpCode, Patch, Post, Request, UseGuards, Body, Param } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionsDto } from './transactions.dto/create-transactions.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateTransactionsDto } from './transactions.dto/update-transactions.dto';
import { CreateReviewsDto } from 'src/reviews/reviews.dto/create-reviews.dto';
import { ReviewsService } from 'src/reviews/reviews.service';

@Controller('transactions')
export class TransactionsController {
    constructor(private transactionsService: TransactionsService,
                private reviewsService: ReviewsService
    ){}


@Get(':id')
@UseGuards(AuthGuard)
getByUserIdAsBuyer(@Param('id') id: string,@Request() req){
    return this.transactionsService.getById(req.user.userId, +id)
}

@Post(':id/reviews')
@UseGuards(AuthGuard)
createReview(@Param('id') id: string, @Request() req,@Body() createReviewsDto: CreateReviewsDto ){
    return this.reviewsService.create(req.user.userId, +id, createReviewsDto)
}

@Patch(':id')
@UseGuards(AuthGuard)
update(@Param('id') id: string, @Request() req, @Body() updateTransactionsDto: UpdateTransactionsDto){
    return this.transactionsService.update(req.user.userId, +id, updateTransactionsDto)
}


}
