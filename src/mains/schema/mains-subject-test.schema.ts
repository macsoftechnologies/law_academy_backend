import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class MainsSubjectTest extends Document {
  @Prop({ default: uuid })
  mains_subject_test_id: string;
  @Prop()
  mains_test_id: string;
  @Prop()
  title: string;
  @Prop()
  no_of_qos: string;
  @Prop()
  duration: string;
  @Prop()
  question_paper_file: string;
  @Prop()
  marks: number
}

export const mainsSubjectTestSchema =
  SchemaFactory.createForClass(MainsSubjectTest);
