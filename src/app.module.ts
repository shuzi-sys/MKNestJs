import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { StatsModule } from './stats/stats.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsController } from './reviews/reviews.controller';
import { ReviewsService } from './reviews/reviews.service';

@Module({
  imports: [UserModule, StatsModule, PostsModule, CommentsModule, TransactionsModule, PrismaModule],
  controllers:[ReviewsController],
  providers: [ReviewsService]
})
export class AppModule {}
