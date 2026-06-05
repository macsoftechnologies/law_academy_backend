import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class UserGoal extends Document {
  @Prop({ default: uuid })
  goalId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ default: 120 })
  studyTimeGoalMinutes: number;

  @Prop({ default: 0 })
  studyTimeProgressMinutes: number;

  @Prop({ default: 20 })
  mcqGoalCount: number;

  @Prop({ default: 0 })
  mcqProgressCount: number;
}

export const UserGoalSchema = SchemaFactory.createForClass(UserGoal);
