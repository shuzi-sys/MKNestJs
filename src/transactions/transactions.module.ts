import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { ReviewsService } from 'src/reviews/reviews.service';
import { ReviewsModule } from 'src/reviews/reviews.module';

@Module({
  providers: [TransactionsService],
  controllers: [TransactionsController],
  exports: [TransactionsService],
  imports: [ReviewsModule]
})
export class TransactionsModule {}
