import { ApiProperty } from '@nestjs/swagger';

export class getDashboardDto {
  @ApiProperty()
  userId: string;
}

export class updateProgressDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  itemId: string;

  @ApiProperty()
  activityType: string;

  @ApiProperty()
  lawType: string;

  @ApiProperty()
  isCompleted: boolean;
}

export class updateGoalDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  studyTimeIncrement?: number;

  @ApiProperty({ required: false })
  mcqIncrement?: number;

  @ApiProperty({ required: false })
  studyTimeGoal?: number;

  @ApiProperty({ required: false })
  mcqGoal?: number;
}
