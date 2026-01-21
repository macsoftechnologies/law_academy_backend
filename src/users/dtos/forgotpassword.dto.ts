import { ApiProperty } from "@nestjs/swagger";

export class forgotPasswordDto{
  @ApiProperty()
  userId: string;
  @ApiProperty()
  password: string;
}