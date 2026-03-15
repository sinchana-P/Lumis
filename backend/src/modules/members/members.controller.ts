import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { CreateMemberDto, UpdateMemberDto, MembersQueryDto } from './dto';

@ApiTags('Members')
@Controller('members')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new member' })
  async create(@User() user: any, @Body() createMemberDto: CreateMemberDto) {
    const member = await this.membersService.create(user.id, createMemberDto);
    return {
      success: true,
      data: member,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: this.generateRequestId(),
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all members for user' })
  async findAll(@User() user: any, @Query() query: MembersQueryDto) {
    const members = await this.membersService.findAll(user.id, query);
    return {
      success: true,
      data: members,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: this.generateRequestId(),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member by ID' })
  async findOne(@User() user: any, @Param('id') id: string) {
    const member = await this.membersService.findOne(user.id, id);
    return {
      success: true,
      data: member,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: this.generateRequestId(),
      },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update member' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('photo'))
  async update(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    try {
      // Discard empty-buffer uploads (browser may send filename with no actual bytes)
      const validPhoto = photo && photo.buffer && photo.buffer.length > 0 ? photo : undefined;
      const member = await this.membersService.update(user.id, id, updateMemberDto, validPhoto);
      return {
        success: true,
        data: member,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      };
    } catch (error: any) {
      if (error?.status) throw error;
      throw new HttpException(
        { success: false, error: { code: 'UPDATE_FAILED', message: error?.message || 'Failed to update member' } },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete member (soft delete)' })
  async remove(@User() user: any, @Param('id') id: string) {
    await this.membersService.remove(user.id, id);
    return {
      success: true,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: this.generateRequestId(),
      },
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}