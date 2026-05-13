import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })

export class ComboEnrollment extends Document {

  @Prop({ default: uuid })

  combo_enrollment_id: string;

  @Prop({ required: true })

  userId: string;

  @Prop({ required: true })

  combo_id: string;

  @Prop()

  combo_plan_id: string;

  @Prop()

  payment_id: string;

  @Prop()

  enroll_date: string;

  @Prop()

  expiry_date: string;

  // active | expired | cancelled

  @Prop({ default: 'active' })

  status: string;
  @Prop()
  planId: string;

}

export const comboEnrollmentSchema = SchemaFactory.createForClass(ComboEnrollment);