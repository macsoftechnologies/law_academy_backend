import { ApiProperty } from '@nestjs/swagger';

export class personalInformationDto {
  @ApiProperty()
  userId: string;
  @ApiProperty()
  date_of_birth: string;
  @ApiProperty()
  gender: string;
  @ApiProperty()
  mother_name: string;
  @ApiProperty()
  father_name: string;
  @ApiProperty()
  corresponding_address: string;
  @ApiProperty()
  permanent_address: string;
}
