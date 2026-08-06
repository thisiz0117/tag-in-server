import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';

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
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
