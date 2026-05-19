import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStatsDto } from './stats.dto/create-stats.dto';
import { UpdateStatsDto } from './stats.dto/update-stats.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Messages } from 'src/error-messages/error-messages'

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService){}

    // Función de validación para ver evitar manipulacion sin permiso
    private async commentOwnershipValidation(statsId: number, userId: number){
            const[stats, user] = await Promise.all([
            this.prisma.stats.findUnique({where: {id:statsId}}),
            this.prisma.user.findUnique({where: {id: userId}, select:{isAdmin:true}})
        ])
        if (!stats){
            throw new NotFoundException(Messages.stats.notFound)
        }
        if (userId != stats.userId && user?.isAdmin != true){
            throw new ForbiddenException(Messages.stats.forbidden)
        }
    
        return;
    }
    //

    async create(userId: number, createStatsDto: CreateStatsDto){
        return this.prisma.stats.create({
            data: {
                userId: userId,
                buyerReputation: createStatsDto.buyerReputation,
                sellerReputation: createStatsDto.sellerReputation
            }})
    }

    async update(statsId: number, userId: number, updateStatsDto: UpdateStatsDto){
    await this.commentOwnershipValidation(statsId, userId)
    return this.prisma.stats.update({where:{id:userId}, data: updateStatsDto})
    }
    async delete(statsId: number, userId: number){
    await this.commentOwnershipValidation(statsId, userId)
    await this.prisma.stats.delete({where: {id:statsId}})
    }
}