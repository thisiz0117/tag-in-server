import { IsEmail, IsEnum, IsString, IsUrl } from 'class-validator'
import { Providers } from '../user/database/providers.enum'

export class UserPayloadDto {
  @IsEnum(Providers)
  @IsString()
  provider!: Providers

  @IsString()
  providerSub!: string

  @IsUrl()
  profile!: string

  @IsString()
  name!: string

  @IsEmail()
  @IsString()
  email!: string
}
