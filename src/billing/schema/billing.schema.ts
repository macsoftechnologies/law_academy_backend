import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid';

export enum BillingStatus {
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Billing extends Document {
  @Prop({ default: uuid })
  billing_id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  enroll_id: string;

  @Prop({ required: true })
  planId: string;

  @Prop({ required: true })
  course_id: string;

  @Prop({ required: true })
  enroll_type: string;

  @Prop({ required: true })
  payment_id: string;

  @Prop({ required: true })
  amount_paise: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  transaction_date: string;

  @Prop({ required: true })
  billing_cycle: string;

  @Prop({ required: true })
  valid_till: string;

  @Prop({ default: BillingStatus.PAID })
  billing_status: string;

  // GST fields
  @Prop({ default: 18 })
  gst_percent: number;

  @Prop()
  base_amount_paise: number;

  @Prop()
  gst_amount_paise: number;
}

export const BillingSchema = SchemaFactory.createForClass(Billing);
