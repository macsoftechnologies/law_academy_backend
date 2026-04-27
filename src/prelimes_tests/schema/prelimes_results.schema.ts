import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist';

@Schema({ timestamps: true })
export class PrelimesResults extends Document {
  @Prop({ default: uuid })
  prelimes_result_id: string;

  @Prop({ index: true })
  userId: string;

  @Prop({ index: true })
  testId: string; // 🔥 REQUIRED for ranking per test

  @Prop({ index: true })
  attemptId: string;

  @Prop()
  attemptNumber: number; // 🔥 for showing Attempt 1, 2, 3

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

  @Prop()
  rank: number;

  @Prop()
  totalParticipants: number;

  @Prop()
  percentile: number;

  @Prop()
  totalTime: number; 
}

export const prelimesResultSchema =
  SchemaFactory.createForClass(PrelimesResults);