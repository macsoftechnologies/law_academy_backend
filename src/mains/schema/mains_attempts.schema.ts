import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { mainsAttemptStatus } from 'src/auth/guards/roles.enum';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class MainsAttempts extends Document {
  @Prop({ default: uuid })
  mains_attempt_id: string;
  @Prop()
  mains_subject_test_id: string;
  @Prop()
  userId: string
  @Prop()
  date: string;
  @Prop()
  time: string;
  @Prop()
  answer_script_file: string;
  @Prop({ default: mainsAttemptStatus.PENDING })
  status: string
  @Prop()
  attempt_no: number
}

export const mainsAttemptSchema = SchemaFactory.createForClass(MainsAttempts);
