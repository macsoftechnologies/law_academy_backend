import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TicketType } from '../schema/ticket.schema';

export class CreateTicketDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(TicketType, { message: 'ticket_type must be either course or support' })
    @IsNotEmpty()
    ticket_type: TicketType;
}