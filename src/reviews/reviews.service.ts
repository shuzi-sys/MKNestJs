import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewsDto } from './reviews.dto/create-reviews.dto';
import { Role } from '@prisma/client';
import { Messages } from 'src/error-messages/error-messages';
// no, no tiene "update" ni "delete" porque no lo veia muy logico
// es un poco raro que los marketplaces te dejen editarlas / eliminarlas

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService){}

    async getByUserIdWithRole(userId: number, role : 'buyer' | 'seller'){
        switch(role){
            case 'buyer': {return this.getByUserIdAsBuyer(userId)}
            case 'seller': {return this.getByUserIdAsSeller(userId)}
            default: { throw new ForbiddenException('Review con rol no valido') }
        }
    }

    // ESTA se usa cuando queres ver que opinan otros vendedores con respecto a un comprador
    async getByUserIdAsBuyer(userId: number){
        return this.prisma.review.findMany({where:{reviewedId:userId, role: Role.SELLER}})
    }

    // ESTA se usa cuando queres ver que opinan otros compradores con respecto a un vendedor
    async getByUserIdAsSeller(userId: number){
        return this.prisma.review.findMany({where:{reviewedId:userId, role: Role.BUYER}})
    }

    async getById(reviewId: number){
        const review = this.prisma.review.findUnique({where:{id:reviewId}})
        if (!review) { throw new NotFoundException('not found') }
        return this.prisma.review.findUnique({where:{id:reviewId}})
    }
    
    /*Este metodo era un poco dificil de optimizar, tenia que traer si o si la transaccion
    para saber si la persona que solicita el create de review participó en una actividad
    de compra o venta y cuál. 
    El tema es que también necesito computar las reputaciones para hacer los calculos de rep
    y eso implica traer también las stats de los implicados. No podía dividirlo en dos query
    porque el delay se iba al carajo, así que queda dentro de la misma query de validacion
    Tambien reconozco que con esfuerzo habria podrido simplificarlo un poco*/
    async create(userId: number, transactionId: number, createReviewsDto: CreateReviewsDto){
        
        const transaction = await this.prisma.transaction.findFirst(
            {where:{id:transactionId},
            include: {
                seller: {select:{stats:true, reviewsGiven:true, reviewsReceived:true}},
                buyer: {select:{stats:true, reviewsGiven:true, reviewsReceived:true}}
            }})
        if (!transaction){
            throw new NotFoundException(Messages.transactions.notFound)
        }
        const buyerId = transaction!.buyerId
        const sellerId = transaction!.sellerId

        // validación antes de review
        if (userId != sellerId && userId != buyerId){
            throw new ForbiddenException(Messages.transactions.forbidden)
        }
        const role = userId === sellerId ? Role.SELLER : Role.BUYER

        switch (role){
            case Role.BUYER:{
                const newCount = transaction!.seller!.stats!.sellerReputationCount + 1
                const newRep = (transaction!.seller!.stats!.sellerReputation + createReviewsDto!.score!) / newCount
                return this.prisma.$transaction([
                    this.prisma.review.create({
                        data: {
                            score: createReviewsDto.score!,
                            transactionId: transactionId,
                            reviewerId: userId,
                            role: Role.BUYER,
                            reviewedId: sellerId
                        }
                    }),
                    this.prisma.stats.update({where: {userId:sellerId}, 
                        data: {
                            sellerReputationCount: newCount, 
                            sellerReputation: newRep
                        }})
                ])}
            case Role.SELLER:{
                const newCount = (transaction!.buyer!.stats!.buyerReputationCount + 1)
                const newRep = (transaction!.buyer!.stats!.buyerReputation + createReviewsDto.score!) / newCount
                return this.prisma.$transaction([
                this.prisma.review.create({
                    data: {
                        score: createReviewsDto.score!,
                        transactionId: transactionId,
                        reviewerId: userId,
                        role: Role.SELLER,
                        reviewedId: buyerId
                    }
                }),
                this.prisma.stats.update({where: {userId:buyerId},
                data:{
                    buyerReputationCount: newCount,
                    buyerReputation: newRep
                }})])
            }
        }
    }

}
