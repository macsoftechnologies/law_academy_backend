import { ApiProperty } from "@nestjs/swagger"

export class couponDto{
    @ApiProperty()
    couponId: string
    @ApiProperty()
    coupon_code: string
    @ApiProperty()
    offer_amount: number
    @ApiProperty()
    status: string
    @ApiProperty()
    valid_from: Date
    @ApiProperty()
    valid_to: Date
}