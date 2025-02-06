import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from '@/common/constants'
import { UserEntity } from './entities/user.entity'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { LoggerService } from '@/module/monitor/logger/logger.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  providers: [UserService, LoggerService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule.forFeature([UserEntity])],
})
export class UserModule {}
