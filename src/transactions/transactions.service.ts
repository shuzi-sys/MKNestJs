import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateTransactionsDto } from './transactions.dto/create-transactions.dto';
import { UpdateTransactionsDto } from './transactions.dto/update-transactions.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Messages } from 'src/error-messages/error-messages';
import { TransactionStatus, PostStatus } from '@prisma/client'

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService){}


    async getByUserIdWithRole(userId: number, role?: 'buyer' | 'seller'){
            switch (role){
        case 'buyer': {return this.getByUserIdAsBuyer(userId)}
        case 'seller':{return this.getByUserIdAsSeller(userId)}
        default: { return this.getByUserId(userId)}
    }
    }

    async getByUserIdAsBuyer(userId: number){
        return this.prisma.transaction.findMany({where:{buyerId:userId}})
    }

    async getByUserIdAsSeller(userId: number){
        return this.prisma.transaction.findMany({where:{sellerId:userId}})
    }

    async getByUserId(userId: number){
        const [asBuyer, asSeller] = await this.prisma.$transaction([
            this.prisma.transaction.findMany({where:{buyerId:userId}}),
            this.prisma.transaction.findMany({where:{sellerId:userId}})
        ])
        return asBuyer.concat(asSeller)
    }


    // no es posible traer la transaccion de otra persona (privacidad)
    async getById(selfId: number, transactionId: number){
        const [transaction, user] = await this.prisma.$transaction([
        this.prisma.transaction.findUnique({where:{id:transactionId}}),
        this.prisma.user.findUnique({where:{id:selfId}, select: {isAdmin:true}})
    ])
    if (user == null || transaction == null) {throw new NotFoundException(Messages.transactions.notFound)}
    if (transaction.buyerId === selfId || transaction!.sellerId === selfId || user!.isAdmin)
    {return transaction} 
    else { throw new UnauthorizedException(Messages.transactions.forbidden) }       
    }

    /* No podes comprar algo sin stock, al decrementar el stock a 0 la publicacion se pausa y 
    un vendedor no puede comprar su propia publicacion, tambien use una transacción atómica
    para decrementar las unidades del post y pausa la publicación si la cantidad llega a 0 */
    async create(userId: number, postId: number, createTransactionsDto: CreateTransactionsDto){
        const post = await this.prisma.post.findUnique({where: {id:postId}, select:{status:true, amount:true, title:true, price:true, ownerId:true}})
        if (!post){
            throw new NotFoundException(Messages.posts.notFound)
        }
        if (post.ownerId === userId || post.amount <= 0 || post.status != PostStatus.ACTIVE || createTransactionsDto.amount! > post.amount){
            throw new ForbiddenException(Messages.transactions.forbidden)
        }
        const oldAmount = post.amount
        const newAmount = oldAmount - createTransactionsDto.amount!
        const transaction = await this.prisma.$transaction([
            this.prisma.transaction.create({data:{
                buyerId: userId,
                sellerId: post.ownerId,
                postId: postId,
                reason: post.title,
                value: post.price,
                amount: createTransactionsDto.amount!
            }}),
            this.prisma.post.update({
                where:{id:postId}, 
                data: {amount: newAmount, ...(newAmount === 0 && { status: PostStatus.PAUSED })}
            })
        ])
        return transaction
    }
    
    /* 
    Esta debe ser la parte mas fumada del codigo; pero funciona asi:
    Por empezar, solo se puede modificar el estado, mas no el monto, cantidad ni nada mas.
    Primero veo que la solicitud provenga de alguien "involucrado" en la transaccion
    Segundo creo una condicion de cancelamiento (no podes cancelar en etapas intermadias)
    Tercero uso un switch que, si tu solicitud no es valida, te devuelve throws. 
    Si es valida, te pega un break lo que te permite ejecutar el return del final
    No se me ocurria nada mejor y tarde bastante en pensarlo xd
    
    NOTA: LAS ACTUALIZACIONES POSIBLES SON>
    BUYER: Cancelar el pedido (si es posible)
    SELLER: Cancelar el pedido (si es posible) / Confirmar pedido / Colocar como shipped 
    El shipping lo marcaria como entregado la ficticia empresa de logistica, osea, en este momento el codigo no lo toca eso.
    (demasiado tryhard?)
    */

    async update(selfId: number, transactionId: number, updateTransactionsDto: UpdateTransactionsDto){
        // Este metodo ↓↓ no esta separado como validador en otra funcion porque necesito selects especificos.
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
                } else{  throw new ForbiddenException(Messages.transactions.forbidden);}

            default:
                throw new ForbiddenException(Messages.transactions.forbidden);
        }
        return this.prisma.transaction.update({where: {id:transactionId}, data: updateTransactionsDto})
    }

    /* no tiene mucho sentido que se puedan borrar
    async remove(userId: number, transactionId: number){
        const user = await this.prisma.user.findUnique({where: {id:userId}, select:{isAdmin:true}})
        if (user!.isAdmin){
            this.prisma.transaction.delete({where:{id:transactionId}})
        }
        else { throw new ForbiddenException(Messages.transactions.forbidden)}
    }
        */

}
