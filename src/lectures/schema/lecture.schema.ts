import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';
@Schema({ timestamps: true })
export class Lecture extends Document {
  @Prop({ default: uuid })
  lectureId: string;
  @Prop()
  lecture_no: string;
  @Prop()
  title: string;
  @Prop()
  author: string;
  @Prop()
  description: string;
  @Prop()
  video_url: string;
  @Prop()
  thumbnail_image_url: string;
  @Prop()
  notes_pdf_url: string;
  @Prop()
  subjectId: string;
  @Prop()
  lawId: string;
  @Prop()
  subcategory_id: string;
  @Prop()
  categoryId: string;
  @Prop({default: true})
  isLocked: boolean
}

export const lectureSchema = SchemaFactory.createForClass(Lecture);
