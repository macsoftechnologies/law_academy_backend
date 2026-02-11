import { ApiProperty } from '@nestjs/swagger';

export class mainsDto {
  @ApiProperty()
  mains_id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  sub_title: string;
  @ApiProperty()
  about_course: string;
  @ApiProperty()
  course_points: [];
  @ApiProperty()
  terms_conditions: string;
  @ApiProperty()
  presentation_image: string
  @ApiProperty()
  subcategory_id: string
}
