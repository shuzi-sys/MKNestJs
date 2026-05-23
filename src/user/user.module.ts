import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CommentsModule } from 'src/comments/comments.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { ReviewsModule } from 'src/reviews/reviews.module';

@Module({
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
  imports: [CommentsModule, TransactionsModule, ReviewsModule]
})
export class UserModule {}
