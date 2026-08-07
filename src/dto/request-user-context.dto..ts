import { IsDate, IsEmail, IsEnum, IsNumber, IsString, IsUrl } from "class-validator";
import { Roles } from "../user/database/roles.enum";
import { UserStatus } from "../user/database/status.enum";

export class RequestUserContextDto {
  @IsNumber()
  id!: string

  @IsEmail()
  @IsString()
  email!: string

  @IsString()
  name!: string

  @IsUrl()
  @IsString()
  profile!: string

  @IsEnum(Roles)
  @IsString()
  role!: Roles

  @IsEnum(UserStatus)
  @IsString()
  status!: UserStatus

  @IsDate()
  createdAt!: Date
  
  @IsDate()
  updatedAt!: Date
}