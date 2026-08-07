import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './database/user.schema';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [],
  exports: [TypeOrmModule.forFeature([Users])]
})
export class UserModule {}
