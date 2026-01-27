import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js'
@Schema({ timestamps: true })

export class Law extends Document {
  @Prop({ default: uuid })
  lawId: string;
  @Prop()
  title: string;
  @Prop()
  law_image: string;
  @Prop()
  subcategory_id: string;
  @Prop()
  categoryId: string
}

export const lawSchema = SchemaFactory.createForClass(Law);
