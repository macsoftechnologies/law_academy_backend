import { ApiProperty } from '@nestjs/swagger';

export class verifyDto {
  @ApiProperty()
  userId: string;
  @ApiProperty()
  otp: string;
  @ApiProperty({ required: false })
  force?: boolean;
}
