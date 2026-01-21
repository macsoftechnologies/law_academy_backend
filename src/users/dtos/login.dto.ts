import { ApiProperty } from '@nestjs/swagger';

export class loginDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  mobile_number: string;
  @ApiProperty()
  password: string;
}
