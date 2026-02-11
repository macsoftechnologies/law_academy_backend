import { ApiProperty } from '@nestjs/swagger';

export class mainsTestDto {
  @ApiProperty()
  mains_test_id: string;
  @ApiProperty()
  mains_id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  no_of_qs: string;
  @ApiProperty()
  no_of_subjects: string;
  @ApiProperty()
  presentation_image: string;
  @ApiProperty()
  terms_conditions: string
}
