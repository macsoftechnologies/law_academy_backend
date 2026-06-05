import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { Referral, ReferralSchema } from './schema/referral.schema';
import { ReferralClaim, ReferralClaimSchema } from './schema/referral-claim.schema';
import { User, userSchema } from '../users/schemas/user.schema';
import { Coupon, couponSchema } from '../coupons/schema/coupon.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referral.name, schema: ReferralSchema },
      { name: ReferralClaim.name, schema: ReferralClaimSchema },
      { name: User.name, schema: userSchema },
      { name: Coupon.name, schema: couponSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
