import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { couponDto } from './dto/coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('/add')
  async addCoupon(@Body() req: couponDto) {
    try {
      const addcoupon = await this.couponsService.createCoupon(req);
      return addcoupon;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Get('/')
  async getCoupons(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const getlist = await this.couponsService.getCouponsList(
        Number(page),
        Number(limit),
      );
      return getlist;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/details')
  async getCouponDetails(@Body() req: couponDto) {
    try{
      const getdetails = await this.couponsService.getCouponById(req);
      return getdetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/update')
  async updatecoupon(@Body() req: couponDto) {
    try{
      const getdetails = await this.couponsService.updateCoupon(req);
      return getdetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/delete')
  async deletecoupon(@Body() req: couponDto) {
    try{
      const getdetails = await this.couponsService.deleteCoupon(req);
      return getdetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}
