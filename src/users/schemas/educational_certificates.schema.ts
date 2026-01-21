import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid/dist/index.js';
@Schema({ timestamps: true })

export class EducationalCertificates extends Document{
    @Prop({ default: uuid })
    certificate_id: string
    @Prop()
    certificate_standard: string
    @Prop()
    marks_cgpa: string
    @Prop()
    institute_name: string
    @Prop()
    certificate_file: string
    @Prop()
    userId: string
}

export const educationalCertificatesSchema = SchemaFactory.createForClass(EducationalCertificates);