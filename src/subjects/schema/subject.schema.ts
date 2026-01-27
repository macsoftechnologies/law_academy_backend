import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';
@Schema({ timestamps: true })

export class Subject extends Document {
  @Prop({ default: uuid })
  subjectId: string;
  @Prop()
  title: string;
  @Prop()
  subject_image: string;
  @Prop()
  law_id: string;
  @Prop()
  subcategory_id: string;
  @Prop()
  categoryId: string;
}

export const subjectSchema = SchemaFactory.createForClass(Subject);
