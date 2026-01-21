import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role } from "src/auth/guards/roles.enum";
import { v4 as uuid } from 'uuid/dist/index.js';
@Schema({ timestamps: true })

export class User extends Document{
    @Prop({ default: uuid })
    userId: string
    @Prop()
    name: string
    @Prop()
    email: string
    @Prop()
    mobile_number: string
    @Prop()
    password: string
    @Prop()
    otp: string
    @Prop()
    referral_code: string
    @Prop()
    referred_by: string
    @Prop()
    date_of_birth: string
    @Prop()
    gender: string
    @Prop()
    mother_name: string
    @Prop()
    father_name: string
    @Prop()
    corresponding_address: string
    @Prop()
    permanent_address: string
    @Prop({ default: Role.STUDENT })
    role: string
}

export const userSchema = SchemaFactory.createForClass(User);