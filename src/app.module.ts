import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    RedisModule.forRoot({
      options: {
        host: 'localhost',
        port: 6379,
        db: 0,
        lazyConnect: true
      },
      type: 'single'
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.IS_PRODUCTION === 'false' ? true : false
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
