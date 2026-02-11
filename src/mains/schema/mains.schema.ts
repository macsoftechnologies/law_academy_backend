import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class Mains extends Document {
  @Prop({ default: uuid })
  mains_id: string;
  @Prop()
  title: string;
  @Prop()
  sub_title: string;
  @Prop()
  about_course: string;
  @Prop()
  course_points: [];
  @Prop()
  terms_conditions: string;
  @Prop()
  presentation_image: string
  @Prop()
  subcategory_id: string
}

export const mainsSchema = SchemaFactory.createForClass(Mains);
