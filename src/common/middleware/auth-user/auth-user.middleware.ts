import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { NextFunction, type Request, type Response } from 'express'
import { AccessTokenPayloadDto } from '../../../auth/dto/access-token-payload.dto'

@Injectable()
export class AuthUserMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessTokenCookie = req.cookies['__HOST-ACS']
    try {
      const accessTokenPayload = await this.jwtService.verifyAsync<AccessTokenPayloadDto>(accessTokenCookie, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      })
      req['user'] = accessTokenPayload
    } catch (e) {
      throw new UnauthorizedException('인증 정보 일부가 유실되었습니다.')
    }

    try {
      const refreshTokenCookie = req.cookies['__HOST-REF']
      await this.jwtService.verifyAsync(refreshTokenCookie, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      })
    } catch (e) {
      throw new UnauthorizedException('재인증 정보 일부가 유실되었습니다.')
    }

    next()
  }
}
