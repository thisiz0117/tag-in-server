import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { AuthService } from '../auth.service'
import { UserPayloadDto } from '../../dto/user-payload.dto'
import { Providers } from '../../user/database/providers.enum'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const user = {
      provider: Providers.GOOGLE,
      providerSub: profile.id,
      profile: profile.picture,
      email: profile.emails[0].value,
      name: profile.displayName,
    } as UserPayloadDto

    const result = await this.authService.upsert(user)
    done(null, result)
  }
}
