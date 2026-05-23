import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
   // config inicial obligatoria, sino no compila
   constructor(){
      const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl: false });
      super({adapter})}


   
 async onModuleInit(){
    await this.$connect();
 }
}