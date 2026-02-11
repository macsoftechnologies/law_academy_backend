import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class MainsResults extends Document {
  @Prop({ default: uuid })
  mains_result_id: string;
  @Prop()
  mains_attempt_id: string;
  @Prop()
  date_of_submission: string;
  @Prop()
  date_of_evaluation: string;
  @Prop()
  marks_scored: number;
  @Prop()
  overall_percentage: number;
  @Prop()
  feedback: string;
  @Prop()
  strengths: [];
  @Prop()
  to_improve: [];
}

export const mainsResultSchema = SchemaFactory.createForClass(MainsResults);
