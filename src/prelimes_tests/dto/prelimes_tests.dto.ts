import { ApiProperty } from '@nestjs/swagger';

export class prelimesTestDto {
  @ApiProperty()
  prelimes_test_id: string;
  @ApiProperty()
  prelimes_id: string;
  @ApiProperty()
  test_type: string;
  @ApiProperty()
  test_number: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  no_of_qos: string;
  @ApiProperty()
  duration: string;
  @ApiProperty()
  mocktest_subject_id: string;
}
