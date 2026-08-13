import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { MediaType } from '../constant/media-type.enum';

export class UploadMediaDto {
  @IsUrl()
  @IsNotEmpty()
  @IsString()
  url!: string;

  @IsEnum(MediaType)
  mediaType!: MediaType;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isVideoSaved?: boolean = false;

  @IsOptional()
  @IsString()
  description?: string;
}