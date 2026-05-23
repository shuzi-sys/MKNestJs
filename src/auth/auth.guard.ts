import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(private jwtService: JwtService){}

    async canActivate(context: ExecutionContext){
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization;
        const token = authorization?.split(' ')[1]

        if (!token){
            throw new UnauthorizedException()
        }

        try{
            const tokenPayLoad = await this.jwtService.verifyAsync(token)
            request.user = {
                userId: tokenPayLoad.sub,
                username: tokenPayLoad.username
            }
            return true
        } catch(err){
            throw new UnauthorizedException()
        }
    }
}
