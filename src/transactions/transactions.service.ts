import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionsDto } from './transactions.dto/create-transactions.dto';
import { UpdateTransactionsDto } from './transactions.dto/update-transactions.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Messages } from 'src/error-messages/error-messages';
import { TransactionStatus } from '@prisma/client'

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService){}

    private async transactionValidation(postId: number){
        const post = await this.prisma.post.findUnique({where: {id:postId}, select:{title:true}})
        
    }

    async create(userId: number, sellerId: number, postId: number, createTransactionsDto: CreateTransactionsDto){
        const post = await this.prisma.post.findUnique({where: {id:postId}, select:{title:true, price:true}})
        if (!post){
            throw new NotFoundException(Messages.posts.notFound)
        }
        return this.prisma.transaction.create({
            data:{
                buyerId: userId,
                sellerId: sellerId,
                postId: postId,
                reason: post.title,
                value: post.price,
                amount: createTransactionsDto.amount!
            }
        })
    }
    
    /* 
    Esta debe ser la parte mas fumada del codigo; pero funciona asi:
    Por empezar, solo se puede modificar el estado, mas no el monto, cantidad ni nada mas.
    Primero veo que la solicitud provenga de alguien "involucrado" en la transaccion
    Segundo creo una condicion de cancelamiento (no podes cancelar en etapas intermadias)
    Tercero uso un switch que, si tu solicitud no es valida, te devuelve throws. 
    Si es valida, te pega un break lo que te permite ejecutar el return del final
    No se me ocurria nada mejor y tarde bastante en pensarlo xd
    */

    async update(selfId: number, transactionId: number, updateTransactionsDto: UpdateTransactionsDto){
        const transaction = await this.prisma.transaction.findUnique({where: {id:transactionId}, select: {buyerId: true, sellerId:true, status:true}})
        if (!transaction){
            throw new NotFoundException(Messages.transactions.notFound)
        }
        const isBuyer = (selfId === transaction.buyerId)
        const isSeller = (selfId === transaction.sellerId)

        if (!isBuyer && !isSeller) 
            {throw new ForbiddenException(Messages.transactions.forbidden)}

        const canCancel = 
        transaction.status === TransactionStatus.PENDING || transaction.status === TransactionStatus.CONFIRMED;
        
        switch(updateTransactionsDto.status){
            case TransactionStatus.CANCELED:
                if (canCancel){break;} 
                else { throw new ForbiddenException(Messages.transactions.atpForbidden); }

            case TransactionStatus.CONFIRMED:
                if (isSeller){
                    if (transaction.status == TransactionStatus.PENDING){break;} 
                    else { throw new ForbiddenException(Messages.transactions.atpForbidden);}
                }else{ throw new ForbiddenException(Messages.transactions.forbidden);}
            case TransactionStatus.SHIPPED:
                if (isSeller){
                if (transaction.status == TransactionStatus.CONFIRMED){
                    return this.prisma.transaction.update({where:{id:transactionId}, data:updateTransactionsDto})
                }
                else {throw new ForbiddenException(Messages.transactions.atpForbidden)}
                } else{  throw new ForbiddenException(Messages.transactions.forbidden); break;}

            default:
                throw new ForbiddenException(Messages.transactions.forbidden); break;
        }
        return this.prisma.transaction.update({where: {id:transactionId}, data: updateTransactionsDto})
    }

    async delete(userId: number, transactionId: number){
        const user = await this.prisma.user.findUnique({where: {id:userId}, select:{isAdmin:true}})
        if (user!.isAdmin){
            this.prisma.transaction.delete({where:{id:transactionId}})
        }
        else { throw new ForbiddenException(Messages.transactions.forbidden)}
    }

}
