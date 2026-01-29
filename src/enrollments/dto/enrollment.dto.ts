import { ApiProperty } from '@nestjs/swagger';

export class enrollmentDto {
  @ApiProperty()
  enroll_id: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  course_id: string;
  @ApiProperty()
  enroll_date: string;
  @ApiProperty()
  expiry_date: string;
  @ApiProperty()
  payment_id: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  enroll_type: string
  @ApiProperty()
  planId: string
}
