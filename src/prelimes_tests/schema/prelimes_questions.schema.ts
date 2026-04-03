import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class PrelimesQuestion extends Document {
  @Prop({ default: uuid })
  questionId: string;
  @Prop()
  prelimes_test_id: string;
  @Prop()
  question: string;
  @Prop({ type: [String] })
  options: string[];
  @Prop()
  correctAnswer: number;
  @Prop({ default: 1 })
  marks: number;
  @Prop()
  summary: string[];
  @Prop()
  question_number: number;
}

export const prelimesQuestionSchema = SchemaFactory.createForClass(PrelimesQuestion);
