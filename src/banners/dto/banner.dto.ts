import { ApiProperty } from "@nestjs/swagger";

export class bannerDto{
    @ApiProperty()
    bannerId: string
    @ApiProperty()
    banner_file: string
}