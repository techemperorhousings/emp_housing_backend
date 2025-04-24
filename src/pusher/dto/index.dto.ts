import { IsNotEmpty, IsString } from 'class-validator';

export class PusherAuthDto {
  @IsNotEmpty()
  @IsString()
  socket_id: string;

  @IsNotEmpty()
  @IsString()
  channel_name: string;
}
