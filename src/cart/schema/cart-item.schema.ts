import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class CartItem extends Document {
  @Prop({ default: uuid })
  cartItemId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  course_id: string;

  @Prop({ required: true })
  enroll_type: string;

  @Prop({ required: true })
  planId: string;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
