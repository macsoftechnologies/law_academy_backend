import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Coupon } from '../coupons/schema/coupon.schema';
import { Referral } from './schema/referral.schema';
import { ReferralClaim } from './schema/referral-claim.schema';
import { couponStatus } from 'src/auth/guards/roles.enum';
import { NotificationsService } from 'src/notifications/notifications.service';

const REFERRAL_REWARD_AMOUNT = 1000; // Reward in local currency per successful first purchase

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
    @InjectModel(Referral.name) private readonly referralModel: Model<Referral>,
    @InjectModel(ReferralClaim.name) private readonly referralClaimModel: Model<ReferralClaim>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Called when a user completes a purchase.
   * If they were referred by a user and this is their first purchase,
   * award referral earnings to the referrer.
   */
  async handleReferralPurchase(referredId: string, enroll_id: string, course_id: string) {
    try {
      // Find the buyer
      const buyer = await this.userModel.findOne({ userId: referredId });
      if (!buyer || !buyer.referred_by) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No referral associated with this buyer',
        };
      }

      // Find the referrer by referral code
      const referrer = await this.userModel.findOne({ referral_code: buyer.referred_by });
      if (!referrer) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Referrer not found for the given referral code',
        };
      }

      // Referrers cannot refer themselves
      if (referrer.userId === buyer.userId) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Users cannot refer themselves',
        };
      }

      // Check if referrer has already been rewarded for this referred buyer
      const existingReferral = await this.referralModel.findOne({ referredId });
      if (existingReferral) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Referral reward already awarded for this referred user',
        };
      }

      // Award referral reward
      const newReferral = await this.referralModel.create({
        referrerId: referrer.userId,
        referredId: buyer.userId,
        enroll_id,
        course_id,
        amount: REFERRAL_REWARD_AMOUNT,
      });

      // Trigger notification for the referrer
      try {
        await this.notificationsService.create(
          referrer.userId,
          'Referral Earnings Credited',
          `Your referred friend ${buyer.name} bought a course! You earned ₹${REFERRAL_REWARD_AMOUNT}.`,
          'referral',
          { referredId: buyer.userId, amount: REFERRAL_REWARD_AMOUNT }
        );
      } catch (notiErr) {
        console.error('Failed to create referral purchase notification:', notiErr);
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Referral reward awarded successfully',
        data: newReferral,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  /**
   * Get referral statistics for a user.
   * Total earned, total claimed, remaining balance, list of referrals, and list of claims.
   */
  async getStats(userId: string) {
    try {
      const user = await this.userModel.findOne({ userId });
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      // 1. Total referred signups
      const totalReferralsCount = await this.userModel.countDocuments({
        referred_by: user.referral_code,
      });

      // 2. Successful referrals (where a purchase happened and referral reward was created)
      const successfulReferrals = await this.referralModel.find({ referrerId: userId }).sort({ createdAt: -1 });
      const totalEarned = successfulReferrals.reduce((sum, r) => sum + r.amount, 0);

      // 3. Claims (conversions to coupons)
      const claims = await this.referralClaimModel.find({ userId }).sort({ createdAt: -1 });
      const totalClaimed = claims.reduce((sum, c) => sum + c.amount, 0);

      // 4. Remaining balance
      const remaining = totalEarned - totalClaimed;

      // 5. Enhance successfulReferrals with referred user names
      const enhancedReferrals = await Promise.all(
        successfulReferrals.map(async (ref) => {
          const refUser = await this.userModel.findOne({ userId: ref.referredId });
          return {
            referralId: ref.referralId,
            referredId: ref.referredId,
            referredName: refUser ? refUser.name : 'Unknown User',
            referredEmail: refUser ? refUser.email : '',
            enroll_id: ref.enroll_id,
            course_id: ref.course_id,
            amount: ref.amount,
            createdAt: (ref as any).createdAt,
          };
        }),
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Referral stats fetched successfully',
        data: {
          myReferralsCount: totalReferralsCount,
          successfulReferralsCount: successfulReferrals.length,
          earningsClaimed: totalClaimed,
          earningsRemaining: remaining,
          totalEarned: totalEarned,
          referrals: enhancedReferrals,
          claims: claims,
        },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  /**
   * Convert remaining earnings to a user-restricted coupon.
   * Coupon is valid for 15 days.
   */
  async convertToCoupon(userId: string, amount: number) {
    try {
      if (amount <= 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Conversion amount must be greater than zero',
        };
      }

      const user = await this.userModel.findOne({ userId });
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      // Calculate remaining earnings
      const successfulReferrals = await this.referralModel.find({ referrerId: userId });
      const totalEarned = successfulReferrals.reduce((sum, r) => sum + r.amount, 0);

      const claims = await this.referralClaimModel.find({ userId });
      const totalClaimed = claims.reduce((sum, c) => sum + c.amount, 0);

      const remaining = totalEarned - totalClaimed;

      if (amount > remaining) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Insufficient referral balance. Remaining balance: ${remaining}`,
        };
      }

      // Generate a unique coupon code
      let couponCode = '';
      let couponExists = true;
      while (couponExists) {
        couponCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const existingCoupon = await this.couponModel.findOne({ coupon_code: couponCode });
        couponExists = !!existingCoupon;
      }

      // Fix coupon expiry to 15 days from now
      const validFrom = new Date();
      const validTo = new Date();
      validTo.setDate(validFrom.getDate() + 15);

      // Create Coupon
      const newCoupon = await this.couponModel.create({
        coupon_code: couponCode,
        offer_amount: amount,
        status: couponStatus.ACTIVE,
        valid_from: validFrom,
        valid_to: validTo,
        userId: userId, // User-restricted coupon
      });

      // Record referral claim transaction
      const claim = await this.referralClaimModel.create({
        userId,
        amount,
        couponId: newCoupon.couponId,
        coupon_code: newCoupon.coupon_code,
      });

      // Trigger notification for the claiming user
      try {
        await this.notificationsService.create(
          userId,
          'Referral Coupon Generated',
          `Successfully converted ₹${amount} of earnings into coupon ${couponCode}. Use it within 15 days!`,
          'referral',
          { couponCode, amount }
        );
      } catch (notiErr) {
        console.error('Failed to create coupon claim notification:', notiErr);
      }

      return {
        statusCode: HttpStatus.OK,
        message: `Converted ${amount} earnings to coupon successfully`,
        data: {
          coupon: newCoupon,
          claim: claim,
          expiryMessage: 'Coupon created successfully. Use within 15 days.',
        },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }
}
