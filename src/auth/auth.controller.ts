import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { type Response } from 'express'
import { SessionService } from './session.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleEntry() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res({ passthrough: true }) res: Response) {
    await this.sessionService.sign(res, req.user)
    return res.redirect('http://localhost:3000/')
  }

  @Get('refresh')
  async refreshSession(@Req() req, @Res() res) {
    return await this.sessionService.refresh(req, res)
  }

  @Get('revoke')
  async revokeSession(@Req() req, @Res() res) {
    return await this.sessionService.revoke(req, res)
  }
}
