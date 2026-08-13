import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator'

export class ExtractionAudioOption {
  @IsUrl()
  @IsNotEmpty()
  @IsString()
  url!: string

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  userId!: string
}
