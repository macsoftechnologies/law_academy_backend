import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js';

@Schema({ timestamps: true })
export class InAppNotification extends Document {
  @Prop({ default: uuid })
  notificationId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: ['referral', 'goal_reached', 'enrollment', 'announcement', 'general'], default: 'general' })
  type: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const InAppNotificationSchema = SchemaFactory.createForClass(InAppNotification);
