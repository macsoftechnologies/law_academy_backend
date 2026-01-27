import { ApiProperty } from '@nestjs/swagger';

export class subjectDto {
  @ApiProperty()
  subjectId: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  subject_image: string;
  @ApiProperty()
  law_id: string;
  @ApiProperty()
  subcategory_id: string
  @ApiProperty()
  categoryId: string
}
