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
    if (accessTokenCookie) {
      try {
        const accessTokenPayload = await this.jwtService.verifyAsync<AccessTokenPayloadDto>(accessTokenCookie, {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        })
        req['user'] = accessTokenPayload
      } catch (e) {
        req['user'] = null
      }
    }
    req['user'] = null

    next()
  }
}
