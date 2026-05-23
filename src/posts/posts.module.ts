import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  providers: [PostsService, PrismaService],
  controllers: [PostsController],
  imports: [TransactionsModule, CommentsModule]
})
export class PostsModule {}
