import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';
@Schema({ timestamps: true })

export class SubCategory extends Document {
  @Prop({ default: uuid })
  subcategory_id: string;
  @Prop()
  presentation_image: string;
  @Prop()
  title: string;
  @Prop()
  about_course: string;
  @Prop()
  terms_conditions: string;
  @Prop()
  categoryId: string;
}

export const subCategorySchema = SchemaFactory.createForClass(SubCategory);
