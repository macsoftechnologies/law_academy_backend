import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';
@Schema({ timestamps: true })

export class Banner extends Document {
  @Prop({ default: uuid })
  bannerId: string;
  @Prop()
  banner_file: string;
}

export const bannerSchema = SchemaFactory.createForClass(Banner);
