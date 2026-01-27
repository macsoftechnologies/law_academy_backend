import { ApiProperty } from "@nestjs/swagger";

export class subCategoryDto{
    @ApiProperty()
    subcategory_id: string
    @ApiProperty()
    presentation_image: string
    @ApiProperty()
    title: string
    @ApiProperty()
    about_course: string
    @ApiProperty()
    terms_conditions: string
    @ApiProperty()
    categoryId: string
}