import { ApiProperty } from "@nestjs/swagger";

export class detailsUpdateDto{
    @ApiProperty()
    detailsId: string
    @ApiProperty()
    name: string
    @ApiProperty()
    mobile_number: string
    @ApiProperty()
    email: string
    @ApiProperty()
    userId: string
    @ApiProperty()
    status: string
}