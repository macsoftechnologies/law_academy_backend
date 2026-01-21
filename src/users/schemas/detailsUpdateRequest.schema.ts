import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DetailsRequestStatus } from 'src/auth/guards/roles.enum';
import { v4 as uuid } from 'uuid/dist/index.js';
@Schema({ timestamps: true })

export class DetailsUpdateRequest extends Document {
  @Prop({ default: uuid })
  detailsId: string;
  @Prop()
  name: string;
  @Prop()
  mobile_number: string;
  @Prop()
  email: string;
  @Prop()
  userId: string;
  @Prop({ default: DetailsRequestStatus.PENDING })
  status: string
}

export const detailsUpdateRequestSchema = SchemaFactory.createForClass(DetailsUpdateRequest);
