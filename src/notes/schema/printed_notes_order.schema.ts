import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { orderStatus } from 'src/auth/guards/roles.enum';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class PrintedNotesOrder extends Document {
  @Prop({ default: uuid })
  order_id: string;
  @Prop()
  notes_id: string;
  @Prop()
  userId: string;
  @Prop()
  address_id: string;
  @Prop()
  payment_id: string;
  @Prop()
  coupon_id: string;
  @Prop()
  payment_method: string;
  @Prop({ default: orderStatus.PENDING })
  status: string;
}

export const printedNotesOrderSchema =
  SchemaFactory.createForClass(PrintedNotesOrder);
