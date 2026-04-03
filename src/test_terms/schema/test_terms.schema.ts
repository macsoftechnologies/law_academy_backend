import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid';

@Schema({ timestamps: true })
export class TestTerms extends Document {
  @Prop({ default: uuid })
  test_term_id: string;
  @Prop()
  terms_conditions: string[];
  @Prop()
  testType: string;
  @Prop()
  instructions: string[];
}

export const testTermsSchema = SchemaFactory.createForClass(TestTerms);
