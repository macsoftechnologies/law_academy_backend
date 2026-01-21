import { ApiProperty } from "@nestjs/swagger";

export class referralDto{
  @ApiProperty()
  userId: string;
  @ApiProperty()
  referred_by: string;   
}