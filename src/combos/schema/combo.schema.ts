import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

export type LectureAccessType = 'law-based' | 'subject-based';
export type NotesAccessType = 'law-based' | 'subject-based';

export class LectureConfig {
  access_type: LectureAccessType; // 'law-based' | 'subject-based'
  law_id?: string;                // used when access_type = 'law-based'
  subject_ids?: string[];         // used when access_type = 'subject-based'
}

export class NotesConfig {
  access_type: NotesAccessType;
  law_id?: string;
  subject_ids?: string[];
}

@Schema({ timestamps: true })
export class Combo extends Document {
  @Prop({ default: uuid })
  combo_id: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  presentation_image: string;

  @Prop()
  categoryId: string;

  @Prop()
  subcategory_id: string;

  // Which content types are included in this combo
  @Prop({ default: false })
  includes_lectures: boolean;

  @Prop({ default: false })
  includes_notes: boolean;

  @Prop({ default: false })
  includes_prelimes: boolean;

  @Prop({ default: false })
  includes_mains: boolean;

  // Mains & Prelimes: store the IDs admin selects (all tests under these will be accessible)
  @Prop({ type: [String], default: [] })
  mains_ids: string[];

  @Prop({ type: [String], default: [] })
  prelimes_ids: string[];

  // Lecture access config
  @Prop({ type: Object })
  lecture_config: LectureConfig;

  // Notes access config
  @Prop({ type: Object })
  notes_config: NotesConfig;

  @Prop({ default: true })
  isActive: boolean;
}

export const comboSchema = SchemaFactory.createForClass(Combo);