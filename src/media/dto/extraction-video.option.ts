import { IsEnum, IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator'
import { VideoQuality } from '../constant/video-quality.enum'

export class ExtractionVideoOption {
  @IsUrl()
  @IsNotEmpty()
  @IsString()
  url!: string

  @IsEnum(VideoQuality)
  quality!: VideoQuality

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  userId!: string
}
