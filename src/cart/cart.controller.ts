import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { addCartItemDto, removeCartItemDto, listCartItemsDto, moveFromWishlistDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('/add')
  async addToCart(@Body() req: addCartItemDto) {
    try {
      const result = await this.cartService.addToCart(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  @Post('/remove')
  async removeFromCart(@Body() req: removeCartItemDto) {
    try {
      const result = await this.cartService.removeFromCart(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  @Post('/list')
  async listCart(@Body() req: listCartItemsDto) {
    try {
      const result = await this.cartService.listCart(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  @Post('/move-from-wishlist')
  async moveFromWishlist(@Body() req: moveFromWishlistDto) {
    try {
      const result = await this.cartService.moveFromWishlist(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }
}
