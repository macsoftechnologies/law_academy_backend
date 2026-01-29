import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { enrollmentStatus } from "src/auth/guards/roles.enum";
import { v4 as uuid } from "uuid/dist/index.js"
@Schema({ timestamps: true })

export class Enrollment extends Document{
    @Prop({ default: uuid })
    enroll_id: string
    @Prop()
    userId: string
    @Prop()
    course_id: string
    @Prop()
    enroll_date: string
    @Prop()
    expiry_date: string
    @Prop()
    payment_id: string
    @Prop({ default: enrollmentStatus.ACTIVE })
    status: string
    @Prop()
    enroll_type: string
    @Prop()
    planId: string
}

export const enrollmentSchema = SchemaFactory.createForClass(Enrollment);