import { ApiProperty } from "@nestjs/swagger";

export class mainsAttemptDto{
    @ApiProperty()
    mains_attempt_id: string
    @ApiProperty()
    userId: string
    @ApiProperty()
    mains_subject_test_id: string
    @ApiProperty()
    date: string
    @ApiProperty()
    time: string
    @ApiProperty()
    status: string
    @ApiProperty()
    attempt_no: number
}