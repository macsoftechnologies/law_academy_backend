import { ApiProperty } from '@nestjs/swagger';

export class qaDto {
  @ApiProperty()
  qa_id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  no_of_qs: string;
  @ApiProperty()
  presentation_image: string;
  @ApiProperty()
  video_url: string;
  @ApiProperty()
  pdf_url: string;
  @ApiProperty()
  duration: string;
  @ApiProperty()
  module: string;
  @ApiProperty()
  module_type: string;
  @ApiProperty()
  module_id: string;
  @ApiProperty()
  isLocked: boolean;
}
