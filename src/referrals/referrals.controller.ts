import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { referralStatsDto, convertToCouponDto } from './dto/referral.dto';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post('/stats')
  async getStats(@Body() req: referralStatsDto) {
    try {
      const stats = await this.referralsService.getStats(req.userId);
      return stats;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  @Post('/convert-to-coupon')
  async convertToCoupon(@Body() req: convertToCouponDto) {
    try {
      const result = await this.referralsService.convertToCoupon(req.userId, req.amount);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }
}
