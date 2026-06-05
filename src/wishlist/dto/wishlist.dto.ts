import { ApiProperty } from '@nestjs/swagger';

export class addWishlistItemDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  course_id: string;

  @ApiProperty()
  enroll_type: string;
}

export class removeWishlistItemDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  wishlistItemId: string;
}

export class listWishlistItemsDto {
  @ApiProperty()
  userId: string;
}
