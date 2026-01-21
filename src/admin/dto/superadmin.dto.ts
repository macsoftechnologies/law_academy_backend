import { ApiProperty } from "@nestjs/swagger"

export class superadminDto{
    @ApiProperty()
    superadmin_id: string
    @ApiProperty()
    email: string
    @ApiProperty()
    mobile_number: string
    @ApiProperty()
    password: string
}