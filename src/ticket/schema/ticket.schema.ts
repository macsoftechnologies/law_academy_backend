import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuid } from 'uuid/dist/index.js'

export type TicketDocument = Ticket & Document;

export enum TicketStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
}

export enum TicketType {
    COURSE = 'course',
    SUPPORT = 'support',
}

export enum CallStatus {
    NONE = 'none',
    PENDING = 'pending',
    COMPLETED = 'completed',
    MISSED = 'missed',
}

@Schema({ timestamps: true })
export class TicketMessage {

    @Prop()
    senderId: string;

    @Prop({ required: true })
    senderName: string;

    @Prop({ required: true })
    senderRole: string;

    @Prop({ required: true })
    message: string;

    @Prop({
        type: [{
            userId: String,
            readAt: Date,
        }],
        default: [],
    })
    readBy: {
        userId: string;
        readAt: Date;
    }[];

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;
}

export const TicketMessageSchema = SchemaFactory.createForClass(TicketMessage);

@Schema({ timestamps: true })
export class Ticket {

    @Prop({ default: uuid })
    ticketId: string;

    @Prop()
    userId: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, enum: Object.values(TicketType) })
    ticket_type: TicketType;

    @Prop({ required: true, enum: Object.values(TicketStatus), default: TicketStatus.PENDING })
    status: TicketStatus;

    @Prop({ type: [TicketMessageSchema], default: [] })
    messages: TicketMessage[];

    // Call scheduling
    @Prop({ default: false })
    callScheduled: boolean;

    @Prop({ type: Date, default: null })
    callScheduledAt: Date | null;

    @Prop({ required: true, enum: Object.values(CallStatus), default: CallStatus.NONE })
    callStatus: CallStatus;

    @Prop()
    assignedTo: string;

    @Prop({ default: 0 })
    unreadCountStudent: number;

    @Prop({ default: 0 })
    unreadCountAdmin: number;

    @Prop({ type: Date, default: null })
    lastMessageAt: Date | null;

    @Prop({ type: Date, default: null })
    resolvedAt: Date | null;

    @Prop({ type: Date, default: null })
    closedAt: Date | null;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);