import { ApiProperty } from "@nestjs/swagger";

export class mainsSubjectTestDto{
    @ApiProperty()
    mains_subject_test_id: string
    @ApiProperty()
    mains_test_id: string
    @ApiProperty()
    title: string
    @ApiProperty()
    no_of_qos: string
    @ApiProperty()
    duration: string
    @ApiProperty()
    question_paper_file: string
    @ApiProperty()
    marks: number
}