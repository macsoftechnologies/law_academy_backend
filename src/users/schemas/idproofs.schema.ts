import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';
@Schema({ timestamps: true })
export class IdProof extends Document {
  @Prop({ default: uuid })
  proof_id: string;
  @Prop()
  idType: string;
  @Prop()
  id_number: string;
  @Prop()
  proof_file: string;
  @Prop()
  userId: string;
}

export const idProofsSchema = SchemaFactory.createForClass(IdProof);
