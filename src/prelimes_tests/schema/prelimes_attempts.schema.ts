import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class PrelimesAttempt extends Document {
  @Prop({ default: uuid })
  prelimes_attempt_id: string;
  @Prop()
  userId: string;

  @Prop()
  testId: string;

  @Prop([
    {
      questionId: String,
      selectedAnswer: Number,
      isCorrect: Boolean,
    },
  ])
  answers: any[];

  @Prop()
  startedAt: Date;

  @Prop()
  submittedAt: Date;
}

export const prelimesAttemptSchema =
  SchemaFactory.createForClass(PrelimesAttempt);
