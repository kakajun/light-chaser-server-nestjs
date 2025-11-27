import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UserEntity } from './entities/user.entity'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { LoggerService } from '@/module/monitor/logger/logger.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'jiangKey',
        signOptions: {
          expiresIn: (() => {
            const raw = config.get<string>('JWT_EXPIRES_IN')
            if (raw && /^\d+$/.test(raw)) return Number(raw)
            return config.get<number>('JWT_EXPIRES_IN') ?? 600
          })(),
        },
      }),
    }),
  ],
  providers: [UserService, LoggerService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule.forFeature([UserEntity])],
})
export class UserModule {}
