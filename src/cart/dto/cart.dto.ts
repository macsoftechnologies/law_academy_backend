import { ApiProperty } from '@nestjs/swagger';

export class addCartItemDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  course_id: string;

  @ApiProperty()
  enroll_type: string;

  @ApiProperty()
  planId: string;
}

export class removeCartItemDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  cartItemId: string;
}

export class listCartItemsDto {
  @ApiProperty()
  userId: string;
}

export class moveFromWishlistDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  wishlistItemId: string;

  @ApiProperty()
  planId: string;
}
