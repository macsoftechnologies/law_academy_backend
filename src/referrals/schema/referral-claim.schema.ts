import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class ReferralClaim extends Document {
  @Prop({ default: uuid })
  claimId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  couponId: string;

  @Prop({ required: true })
  coupon_code: string;
}

export const ReferralClaimSchema = SchemaFactory.createForClass(ReferralClaim);
