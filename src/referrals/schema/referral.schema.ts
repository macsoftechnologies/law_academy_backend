import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class Referral extends Document {
  @Prop({ default: uuid })
  referralId: string;

  @Prop({ required: true })
  referrerId: string;

  @Prop({ required: true })
  referredId: string;

  @Prop({ required: true })
  enroll_id: string;

  @Prop({ required: true })
  course_id: string;

  @Prop({ required: true })
  amount: number;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
