import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ArrayMinSize } from 'class-validator';

export class CreatePollDto {
  @IsString()
  @ApiProperty({ example: "Bugun nima mavzu o'tamiz" })
  question: string;

  @IsArray()
  @ArrayMinSize(2)
  @ApiProperty({ example: ['NodeJs', 'Nestjs', 'Mongodb'] })
  options: string[];
}
