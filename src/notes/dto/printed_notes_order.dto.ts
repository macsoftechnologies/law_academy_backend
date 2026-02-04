import { ApiProperty } from '@nestjs/swagger';

export class printedNotesOrderDto {
  @ApiProperty()
  order_id: string;
  @ApiProperty()
  notes_id: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  address_id: string;
  @ApiProperty()
  payment_id: string;
  @ApiProperty()
  coupon_id: string;
  @ApiProperty()
  payment_method: string;
  @ApiProperty()
  status: string;
}
