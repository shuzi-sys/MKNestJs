import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

type AuthInput = {username: string; password: string}
type SignInData = {userId: number; username: string}
type AuthResult = {accessToken: string, userId: number, username: string}

/* El pipe es:
Entra el input, es procesado por el metodo validate user para ver que la 
password sea correcta y corresponda a un user. Despues, entra al metodo
de autenticacion donde se redirige al metodo de firmado, en el firmado
el input se encapsula en un AuthResult y es devuelto firmado por JWT.
*/

@Injectable()
export class AuthService {
    constructor (private usersService: UserService,
                 private jwtService: JwtService){}

    async authenticate(input: AuthInput): Promise<AuthResult>{
        const user = await this.validateUser(input)
        if (!user){
            throw new UnauthorizedException()
        }
        return this.signIn(user)
    }
    async validateUser(input: AuthInput): Promise<SignInData | null>{
        const user = await this.usersService.getByUsername(input.username)
        if (!user){
            return null;
        }
        if (await bcrypt.compare(input.password, user.password)){
            return {
                userId: user.id,
                username: user.username
            }
        }
        return null;
    }

    // aparentemente es convencion en JWT usar de nombre "sub"
    // para el userid (recien me entero)
    async signIn(user: SignInData): Promise<AuthResult>{
        const tokenPayLoad = {
            sub: user.userId,
            username: user.username,
        };
        const accessToken = await this.jwtService.signAsync(tokenPayLoad);
        return {accessToken, username:user.username, userId:user.userId}
    }
}
