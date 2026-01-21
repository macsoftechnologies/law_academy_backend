import { ApiProperty } from '@nestjs/swagger';

export class categoryDto {
  @ApiProperty()
  categoryId: string;
  @ApiProperty()
  category_name: string;
  @ApiProperty()
  tag_text: string;
}
