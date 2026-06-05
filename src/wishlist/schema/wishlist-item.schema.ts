import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class WishlistItem extends Document {
  @Prop({ default: uuid })
  wishlistItemId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  course_id: string;

  @Prop({ required: true })
  enroll_type: string;
}

export const WishlistItemSchema = SchemaFactory.createForClass(WishlistItem);
