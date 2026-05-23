import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { Jwtsecret } from './jwtsecret/jwtsecret';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [UserModule,
        JwtModule.register({
            global:true,
            secret:Jwtsecret,
            signOptions: {expiresIn: '1d'}
        })
    ]
})
export class AuthModuleModule {

}
