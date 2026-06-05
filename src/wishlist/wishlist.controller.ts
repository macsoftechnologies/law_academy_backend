import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { addWishlistItemDto, removeWishlistItemDto, listWishlistItemsDto } from './dto/wishlist.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('/add')
  async addToWishlist(@Body() req: addWishlistItemDto) {
    try {
      const result = await this.wishlistService.addToWishlist(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  @Post('/remove')
  async removeFromWishlist(@Body() req: removeWishlistItemDto) {
    try {
      const result = await this.wishlistService.removeFromWishlist(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  @Post('/list')
  async listWishlist(@Body() req: listWishlistItemsDto) {
    try {
      const result = await this.wishlistService.listWishlist(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }
}
