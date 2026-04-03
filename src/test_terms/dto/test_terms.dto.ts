import { ApiProperty } from '@nestjs/swagger';

export class testTermsDto {
  @ApiProperty()
  test_term_id: string;
  @ApiProperty()
  terms_conditions: string[];
  @ApiProperty()
  testType: string;
  @ApiProperty()
  instructions: string[];
}
