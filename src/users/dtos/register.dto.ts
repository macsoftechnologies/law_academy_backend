import { ApiProperty } from '@nestjs/swagger';

export class registerDto {
  @ApiProperty()
  userId: string
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  mobile_number: string;
  @ApiProperty()
  password: string;
}
