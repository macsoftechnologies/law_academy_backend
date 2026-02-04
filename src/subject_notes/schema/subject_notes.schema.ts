import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class SubjectNotes extends Document {
  @Prop({ default: uuid })
  subject_notes_id: string;
  @Prop()
  notes_id: string;
  @Prop()
  lawId: string;
  @Prop()
  title: string;
  @Prop()
  pdf_url: string;
  @Prop({ default: false })
  isLocked: boolean;
  @Prop()
  presentation_image: string
}

export const subjectNoteSchema = SchemaFactory.createForClass(SubjectNotes);