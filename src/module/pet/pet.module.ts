import { Module } from '@nestjs/common'
import { PetService } from './pet.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PetController } from './pet.controller'
import { PetEntity } from './entities/pet.entity'

@Module({
  imports: [TypeOrmModule.forFeature([PetEntity])],
  controllers: [PetController],
  providers: [PetService],
})
export class PetModule {}
