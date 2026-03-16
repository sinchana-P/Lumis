import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJournalEntryDto {
  @ApiProperty({ description: 'Journal entry content', example: 'Had a great conversation with Sarah today about our project...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Optional title for the journal entry', example: 'Productive Day with Sarah' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Date of the journal entry (YYYY-MM-DD)', example: '2025-03-16' })
  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD

  @ApiPropertyOptional({ 
    description: 'Emotions felt during this interaction', 
    example: ['joyful', 'grateful', 'energized'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  emotions?: string[];

  @ApiPropertyOptional({ 
    description: 'Tags for categorization using prefix:value format', 
    example: ['mood:happy', 'context:work', 'theme:collaboration'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Whether this entry is private', example: true })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
