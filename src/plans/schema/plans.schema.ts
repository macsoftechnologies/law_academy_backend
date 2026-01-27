import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"
import { v4 as uuid } from "uuid/dist/index.js";
@Schema({ timestamps: true })

export class Plan extends Document{
    @Prop({ default: uuid })
    planId: string
    @Prop()
    original_price: string
    @Prop()
    strike_price: string
    @Prop()
    duration: string
    @Prop()
    handling_fee: string
    @Prop()
    course_id: string
    @Prop()
    discount_percent: string
    @Prop()
    course_type: string
}

export const planSchema = SchemaFactory.createForClass(Plan);