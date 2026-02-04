import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { couponStatus } from "src/auth/guards/roles.enum";
import { v4 as uuid } from 'uuid/dist/index.js';
@Schema({ timestamps: true })

export class Coupon extends Document{
    @Prop({ default: uuid })
    couponId: string
    @Prop()
    coupon_code: string
    @Prop()
    offer_amount: number
    @Prop({ default: couponStatus.ACTIVE })
    status: string
    @Prop()
    valid_from: Date
    @Prop()
    valid_to: Date
}

export const couponSchema = SchemaFactory.createForClass(Coupon);