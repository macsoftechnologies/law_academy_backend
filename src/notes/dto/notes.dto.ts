import { ApiProperty } from '@nestjs/swagger';

export class notesDto {
  @ApiProperty()
  notes_id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  sub_title: string;
  @ApiProperty({
    example: {
      description: 'About the book description',
      sections: [
        {
          title: 'Civil Laws',
          topics: ['CPC', 'Contract Act'],
        },
      ],
    },
  })
  about_book: string;
  @ApiProperty()
  presentation_image: string
  @ApiProperty()
  isPrintAvail: boolean
  @ApiProperty()
  printNotes_image:string
  @ApiProperty()
  terms_conditions: string
  @ApiProperty()
  subcategory_id: string
}
