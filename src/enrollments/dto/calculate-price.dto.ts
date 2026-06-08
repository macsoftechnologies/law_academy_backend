import { ApiProperty } from '@nestjs/swagger';

export class CalculatePriceDto {
  @ApiProperty()
  planId: string;

  @ApiProperty({ required: false })
  coupon_code?: string;

  @ApiProperty({ required: false })
  userId?: string;
}
