import { ApiProperty } from "@nestjs/swagger";

export class mockTestSubjectDto{
    @ApiProperty()
    mocktest_subject_id: string
    @ApiProperty()
    presentation_image: string
    @ApiProperty()
    title: string
    @ApiProperty()
    no_of_qos: string
    @ApiProperty()
    duration: string
    @ApiProperty()
    lawId: string
}