import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guard/auth.guard';

@Controller('media')
@UseGuards(AuthGuard)
export class MediaController {
  
}
