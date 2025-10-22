import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: '54534feb-4322-4373-be19-719574c482fc' })
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({ example: 'Holla como esta' })
  @IsNotEmpty()
  message: string;
}
