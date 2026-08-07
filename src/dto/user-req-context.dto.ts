import { IsEnum, IsNumber, IsString } from "class-validator";
import { Roles } from "../user/database/roles.enum";
import { UserStatus } from "../user/database/status.enum";

export class UserRequestContextDto {
  @IsNumber()
  id!: number

  @IsEnum(Roles)
  @IsString()
  role!: Roles

  @IsEnum(UserStatus)
  @IsString()
  status!: UserStatus
}