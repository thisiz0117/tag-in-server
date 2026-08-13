import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator'

export class ExtractionThumbnailOption {
  @IsUrl()
  @IsNotEmpty()
  @IsString()
  url!: string

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  userId!: string
}
