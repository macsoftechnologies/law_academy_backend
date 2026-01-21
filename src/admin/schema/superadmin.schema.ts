import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role } from "src/auth/guards/roles.enum";
import { v4 as uuid } from 'uuid/dist/index.js';
@Schema({ timestamps: true })

export class SuperAdmin extends Document{
    @Prop({ default: uuid })
    superadmin_id: string
    @Prop()
    email: string
    @Prop()
    mobile_number: string
    @Prop()
    password: string
    @Prop({ default: Role.SUPERADMIN })
    role: string
}

export const superadminSchema = SchemaFactory.createForClass(SuperAdmin);