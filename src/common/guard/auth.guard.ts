import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { type Request } from 'express'
import { Observable } from 'rxjs'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>()
    if (!req['user']) throw new UnauthorizedException('미인증 사용자')
    if (!req['refresh']) throw new UnauthorizedException('미인증 사용자')
    return true
  }
}
