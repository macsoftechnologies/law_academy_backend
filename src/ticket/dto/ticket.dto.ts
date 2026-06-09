import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    Max,
    IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketStatus, CallStatus } from '../schema/ticket.schema';

export class AddMessageDto {
    @IsString()
    @IsNotEmpty()
    ticketId: string;

    @IsString()
    @IsNotEmpty()
    senderId: string;

    @IsString()
    @IsNotEmpty()
    message: string;
}

export class UpdateStatusDto {
    @IsString()
    @IsNotEmpty()
    ticketId: string;

    @IsEnum(TicketStatus, {
        message: 'status must be one of: pending, in_progress, resolved, closed',
    })
    status: TicketStatus;
}

export class ScheduleCallDto {
    @IsString()
    @IsNotEmpty()
    ticketId: string;

    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsDateString()
    @IsOptional()
    scheduledAt?: string;
}

export class UserTicketListDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 10;
}

export class TicketDetailsDto {
    @IsString()
    @IsNotEmpty()
    ticketId: string;

    @IsString()
    @IsNotEmpty()
    userId: string;
}

export class MarkMessagesReadDto {
    @IsString()
    @IsNotEmpty()
    ticketId: string;

    @IsString()
    @IsNotEmpty()
    userId: string;
}

export class AdminTicketListDto {
    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;
}

export class UpdateCallStatusDto {
    @IsString()
    @IsNotEmpty()
    ticketId: string;

    @IsEnum(CallStatus, {
        message: 'callStatus must be one of: none, pending, completed, missed',
    })
    callStatus: CallStatus;
}