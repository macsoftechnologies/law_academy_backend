import { ApiProperty } from "@nestjs/swagger";

export class guestLectureDto{
    @ApiProperty()
    guest_lecture_id: string
    @ApiProperty()
    title: string
    @ApiProperty()
    author: string
    @ApiProperty()
    duration: string
    @ApiProperty()
    about_class: string
    @ApiProperty()
    about_lecture: string
    @ApiProperty()
    video_url: string
    @ApiProperty()
    presentation_image: string
}