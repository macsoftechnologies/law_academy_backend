import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class PrelimesTest extends Document {
  @Prop({ default: uuid })
  prelimes_test_id: string;
  @Prop()
  prelimes_id: string;
  @Prop()
  test_type: string;
  @Prop()
  test_number: string;
  @Prop()
  title: string;
  @Prop()
  no_of_qos: string;
  @Prop()
  duration: string;
  @Prop()
  mocktest_subject_id: string;
}

export const prelimesTestSchema = SchemaFactory.createForClass(PrelimesTest);
