import { ApiProperty } from '@nestjs/swagger';

export class mainsTestResultsDto {
  @ApiProperty()
  mains_result_id: string;
  @ApiProperty()
  mains_attempt_id: string;
  @ApiProperty()
  date_of_submission: string;
  @ApiProperty()
  date_of_evaluation: string;
  @ApiProperty()
  marks_scored: number;
  @ApiProperty()
  overall_percentage: number;
  @ApiProperty()
  feedback: string;
  @ApiProperty()
  strengths: [];
  @ApiProperty()
  to_improve: [];
}
