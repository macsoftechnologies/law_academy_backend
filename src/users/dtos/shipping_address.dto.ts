import { ApiProperty } from "@nestjs/swagger";

export class shippingAdressDto{
    @ApiProperty()
    address_id: string
    @ApiProperty()
    full_name: string
    @ApiProperty()
    address: string
    @ApiProperty()
    city: string
    @ApiProperty()
    region: string
    @ApiProperty()
    zip_code: string
    @ApiProperty()
    country: string
    @ApiProperty()
    userId: string
}