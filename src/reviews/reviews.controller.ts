import { Delete, Get, HttpCode, Patch, Post, Request, UseGuards, Query, Body, Param } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateReviewsDto } from './reviews.dto/create-reviews.dto';

@Controller('reviews')
export class ReviewsController {
    
    constructor(private reviewsService: ReviewsService){}

    
    @Get(':id')
    @HttpCode(200)
    getById(@Param('id') id:string){
        return this.reviewsService.getById(+id)
    }

}
