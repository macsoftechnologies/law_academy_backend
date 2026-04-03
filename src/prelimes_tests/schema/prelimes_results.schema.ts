import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist';

@Schema({ timestamps: true })
export class PrelimesResults extends Document {
  @Prop({ default: uuid })
  prelimes_result_id: string;
  @Prop()
  userId: string;
  @Prop()
  attemptId: string;
  @Prop()
  totalQuestions: number;
  @Prop()
  attempted: number;
  @Prop()
  correct: number;
  @Prop()
  wrong: number;
  @Prop()
  skipped: number;
  @Prop()
  score: number;
  @Prop()
  percentage: number;
  @Prop()
  accuracy: number;
  @Prop()
  timeSpent: number;
}

export const prelimesResultSchema = SchemaFactory.createForClass(PrelimesResults);
