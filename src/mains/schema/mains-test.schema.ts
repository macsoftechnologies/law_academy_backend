import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class MainsTest extends Document {
  @Prop({ default: uuid })
  mains_test_id: string;
  @Prop()
  mains_id: string;
  @Prop()
  title: string;
  @Prop()
  no_of_qs: string;
  @Prop()
  no_of_subjects: string;
  @Prop()
  presentation_image: string;
  @Prop()
  terms_conditions: string;
}

export const mainsTestSchema = SchemaFactory.createForClass(MainsTest);
