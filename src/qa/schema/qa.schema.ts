import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class QAModule extends Document {
  @Prop({ default: uuid })
  qa_id: string;
  @Prop()
  title: string;
  @Prop()
  no_of_qs: string;
  @Prop()
  presentation_image: string;
  @Prop()
  video_url: string;
  @Prop()
  pdf_url: string;
  @Prop()
  duration: string;
  @Prop()
  module: string;
  @Prop()
  module_type: string;
  @Prop()
  module_id: string;
  @Prop({ default: true })
  isLocked: boolean;
}

export const QASchema = SchemaFactory.createForClass(QAModule);
