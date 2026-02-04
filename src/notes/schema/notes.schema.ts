import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class Notes extends Document {

  @Prop({ default: uuid })
  notes_id: string;
  @Prop()
  title: string;
  @Prop()
  sub_title: string;
  @Prop({ type: Object })
  about_book: {
    description: string;
    sections: {
      title: string;
      topics: string[];
    }[];
  };
  @Prop()
  presentation_image: string
  @Prop({ default: true })
  isPrintAvail: boolean
  @Prop()
  printNotes_image: string
  @Prop()
  terms_conditions: string
  @Prop()
  subcategory_id: string
}

export const NotesSchema = SchemaFactory.createForClass(Notes);
