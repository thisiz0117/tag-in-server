import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Users } from '../user/database/user.schema'
import { In, Repository } from 'typeorm'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { Redis } from 'ioredis'
import { type Request, type Response } from 'express'
import { JwtService } from '@nestjs/jwt'
import { instanceToPlain, plainToClass } from 'class-transformer'
import { ConfigService } from '@nestjs/config'
import { RefreshTokenPayloadDto } from './dto/refresh-token-payload.dto';
import { RequestUserContextDto } from './dto/request-user-context.dto.';
import { AccessTokenPayloadDto } from './dto/access-token-payload.dto';

@Injectable()
export class SessionService {
  private readonly accessTokenExpireSec = 60 * 15
  private readonly refreshTokenExpireSec = 60 * 60 * 24 * 30
  private readonly isProduction: boolean

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRedis()
    private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.isProduction = !configService.get<boolean>('IS_PRODUCTION')!
  }

  async sign(res: Response, user: RequestUserContextDto): Promise<void> {
    // access token
    const accessTokenJWT = await this.jwtService.signAsync(instanceToPlain(user), {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET')!,
      expiresIn: this.accessTokenExpireSec,
    })

    res.cookie('__Host-ACS', accessTokenJWT, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: this.accessTokenExpireSec * 1000,
    })

    // refresh token
    const jti = crypto.randomUUID()
    const refreshTokenPayload: RefreshTokenPayloadDto = {
      id: user.id,
      jti: jti,
    }
    const refreshTokenJWT = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')!,
      expiresIn: this.refreshTokenExpireSec,
    })

    res.cookie('__Host-REF', refreshTokenJWT, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: this.refreshTokenExpireSec * 1000,
    })

    // redis
    try {
      await this.redis.set(`refresh:${user.id}:${jti}`, '', 'EX', this.refreshTokenExpireSec)
    } catch (e) {
      throw new InternalServerErrorException('데이터베이스에 인증 정보를 저장할 수 없는 문제가 발생했습니다.')
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    // verify jti
    const refreshToken = req.cookies['__HOST-REF']

    const payload = await this.jwtService.verifyAsync<RefreshTokenPayloadDto>(refreshToken, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
    })

    try {
      const isExists = await this.redis.exists(`refresh:${payload.id}:${payload.jti}`)
      if (!isExists) throw new UnauthorizedException('데이터베이스에 인증 정보가 존재하지 않습니다.')
    } catch (e) {
      console.error(e)
      throw new InternalServerErrorException('데이터베이스에 문제가 발생하여 기존 인증 정보를 불러올 수 없습니다.')
    }

    // refresh [ access && refresh ] token
    try {
      const user = await this.usersRepository.findOne({ where: { id: payload.id } })
      if (!user) throw new UnauthorizedException('데이터베이스에서 유저 정보를 찾지 못했습니다.')

      // new AcsTkn
      const newAccessTokenPayload = plainToClass(AccessTokenPayloadDto, user)
      const newAccessTokenJWT = await this.jwtService.signAsync(newAccessTokenPayload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET')!,
        expiresIn: this.accessTokenExpireSec,
      })

      res.cookie('__HOST-ACS', newAccessTokenJWT, {
        httpOnly: true,
        secure: this.isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: this.accessTokenExpireSec * 1000,
      })

      // new RefTkn
      const newJti = crypto.randomUUID()
      const newRefreshTokenPayload: RefreshTokenPayloadDto = {
        id: user.id,
        jti: newJti,
      }
      const newRefreshTokenJWT = await this.jwtService.signAsync(newRefreshTokenPayload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')!,
        expiresIn: this.refreshTokenExpireSec,
      })

      res.cookie('__HOST-REF', newRefreshTokenJWT, {
        httpOnly: true,
        secure: this.isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: this.refreshTokenExpireSec * 1000,
      })
    } catch (e) {
      throw new InternalServerErrorException('데이터베이스에 새로운 인증 정보를 저장할 수 없는 문제가 발생했습니다.')
    }
  }

  async revoke(req: Request, res: Response): Promise<void> {
    const accessTokenCookie = req.cookies['__HOST-ACS']
    if (accessTokenCookie) res.clearCookie('__HOST-ACS')

    const refreshTokenCookie = req.cookies['__HOST-REF']
    res.clearCookie('__HOST-REF')

    const refreshTokenJWT = await this.jwtService.verifyAsync<RefreshTokenPayloadDto>(refreshTokenCookie, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')!,
    })

    try {
      const { id, jti } = refreshTokenJWT
      const isSuccessDel = await this.redis.del(`refresh:${id}:${jti}`)
      if (!isSuccessDel) throw new InternalServerErrorException('로그아웃 중 문제가 발생했습니다.')
    } catch (e) {
      throw new InternalServerErrorException('로그아웃 중 데이터베이스에서 문제가 발생했습니다.')
    }
  }
}
