import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class MockTestSubject extends Document {
  @Prop({default: uuid})
  mocktest_subject_id: string;
  @Prop()
  presentation_image: string;
  @Prop()
  title: string;
  @Prop()
  no_of_qos: string;
  @Prop()
  duration: string;
  @Prop()
  lawId: string;
}

export const mockTestSubjectSchema = SchemaFactory.createForClass(MockTestSubject);
