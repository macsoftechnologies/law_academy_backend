import { ApiProperty } from "@nestjs/swagger";

export class plansDto{
    @ApiProperty()
    planId: string
    @ApiProperty()
    original_price: string
    @ApiProperty()
    strike_price: string
    @ApiProperty()
    duration: string
    @ApiProperty()
    handling_fee: string
    @ApiProperty()
    course_id: string
    @ApiProperty()
    discount_percent: string
    @ApiProperty()
    course_type: string
}