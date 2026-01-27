import { ApiProperty } from "@nestjs/swagger";

export class lawsDto{
    @ApiProperty()
    lawId: string
    @ApiProperty()
    title: string
    @ApiProperty()
    law_image: string
    @ApiProperty()
    subcategory_id: string
    @ApiProperty()
    categoryId: string
}