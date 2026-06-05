import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class UserProgress extends Document {
  @Prop({ default: uuid })
  progressId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  courseId: string;

  @Prop({ required: true, index: true })
  itemId: string;

  @Prop({ required: true })
  activityType: string; // e.g. video, note, pyq, grand_test, mock_test, mains_qa_pdf, etc.

  @Prop({ required: true })
  lawType: string; // e.g. civil, criminal, general

  @Prop({ default: true })
  isCompleted: boolean;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);
