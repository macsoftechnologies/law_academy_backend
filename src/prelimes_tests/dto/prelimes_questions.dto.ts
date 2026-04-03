import { ApiProperty } from '@nestjs/swagger';

export class prelimesQuestionDto {
  @ApiProperty()
  questionId: string;
  @ApiProperty()
  question: string;
  @ApiProperty()
  options: string[];
  @ApiProperty()
  correctAnswer: number;
  @ApiProperty()
  prelimes_test_id?: string;
  @ApiProperty()
  marks?: number;
  @ApiProperty()
  summary: string[];
  @ApiProperty()
  question_number: number;
}
