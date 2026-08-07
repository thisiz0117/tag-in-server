import { IsUUID } from "class-validator";

export class RefreshTokenPayloadDto {
  @IsUUID()
  id!: string

  @IsUUID()
  jti!: string
}