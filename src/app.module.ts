import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { StatsModule } from './stats/stats.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsController } from './reviews/reviews.controller';
import { ReviewsService } from './reviews/reviews.service';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModuleModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [UserModule, StatsModule, PostsModule, CommentsModule, TransactionsModule, PrismaModule, ReviewsModule, AuthModuleModule],
  controllers:[],
  providers: []
})
export class AppModule {}
