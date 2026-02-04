import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class ShippingAddress extends Document {
  @Prop({ default: uuid })
  address_id: string;
  @Prop()
  full_name: string;
  @Prop()
  address: string;
  @Prop()
  city: string;
  @Prop()
  region: string;
  @Prop()
  zip_code: string;
  @Prop()
  country: string;
  @Prop()
  userId: string;
}

export const shippingaddressSchema =
  SchemaFactory.createForClass(ShippingAddress);
