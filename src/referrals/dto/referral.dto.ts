import { ApiProperty } from '@nestjs/swagger';

export class referralStatsDto {
  @ApiProperty()
  userId: string;
}

export class convertToCouponDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  amount: number;
}
