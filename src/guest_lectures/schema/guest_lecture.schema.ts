import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid/dist/index.js';
@Schema({ timestamps: true })

export class GuestLecture extends Document{
    @Prop({ default: uuid })
    guest_lecture_id: string
    @Prop()
    title: string
    @Prop()
    author: string
    @Prop()
    duration: string
    @Prop()
    about_class: string
    @Prop()
    about_lecture: string
    @Prop()
    video_url: string
    @Prop()
    presentation_image: string
}

export const guestLectureSchema = SchemaFactory.createForClass(GuestLecture);