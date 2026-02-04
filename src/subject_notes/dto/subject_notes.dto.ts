import { ApiProperty } from "@nestjs/swagger";

export class subjectNotesDto{
    @ApiProperty()
    subject_notes_id: string
    @ApiProperty()
    notes_id: string
    @ApiProperty()
    lawId: string
    @ApiProperty()
    title: string
    @ApiProperty()
    pdf_url: string
    @ApiProperty()
    isLocked: boolean
    @ApiProperty()
    presentation_image: string
    @ApiProperty()
    userId: string
}