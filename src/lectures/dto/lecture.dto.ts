import { ApiProperty } from "@nestjs/swagger";

export class lectureDto{
    @ApiProperty()
    lectureId: string
    @ApiProperty()
    lecture_no: string
    @ApiProperty()
    title: string
    @ApiProperty()
    author: string
    @ApiProperty()
    description: string
    @ApiProperty()
    video_url: string
    @ApiProperty()
    thumbnail_image_url: string
    @ApiProperty()
    notes_pdf_url: string
    @ApiProperty()
    subjectId: string
    @ApiProperty()
    lawId: string
    @ApiProperty()
    subcategory_id: string
    @ApiProperty()
    categoryId: string
    @ApiProperty()
    isLocked: boolean
    @ApiProperty()
    userId: string
}