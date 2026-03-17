import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MethodologyService } from './methodology.service';

@ApiTags('methodology')
@Controller('methodology')
export class MethodologyController {
  constructor(private readonly service: MethodologyService) {}

  @Get()
  @ApiOperation({ summary: 'Get the full Lumis methodology — formulas, frameworks, and data model' })
  get() {
    return { success: true, data: this.service.getMethodology() };
  }
}
