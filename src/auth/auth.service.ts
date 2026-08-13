import { Injectable } from '@nestjs/common'
import { UserPayloadDto } from '../dto/user-payload.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Users } from '../user/database/user.schema'
import { Repository } from 'typeorm'
import { Roles } from '../user/database/roles.enum'
import { UserStatus } from '../user/database/status.enum'
import { RequestUserContextDto } from '../dto/request-user-context.dto.';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async upsert(user: UserPayloadDto): Promise<RequestUserContextDto> {
    const result = await this.usersRepository
      .createQueryBuilder()
      .insert()
      .into(Users)
      .values({
        email: user.email,
        name: user.name,
        profile: user.profile,
        provider: user.provider,
        provider_sub: user.providerSub,
        role: Roles.USER,
        status: UserStatus.ACTIVE,
      })
      .orUpdate([], ['provider_sub'])
      .returning(['id', 'email', 'name', 'profile', 'role', 'status', 'createdAt', 'updatedAt'])
      .execute()

    return result.raw[0]
  }
}
