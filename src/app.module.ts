import { RedisModule } from '@nestjs-modules/ioredis'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UserModule } from './user/user.module'
import { JwtModule } from '@nestjs/jwt'
import { MediaModule } from './media/media.module';
import { AuthMiddleware } from './common/middleware/auth-user/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule.forRoot({
      options: {
        host: 'localhost',
        port: 6379,
        db: 0,
        lazyConnect: true,
      },
      type: 'single',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: process.env.IS_PRODUCTION === 'false' ? true : false,
    }),
    JwtModule.register({}),
    AuthModule,
    UserModule,
    MediaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*')
  }
}
