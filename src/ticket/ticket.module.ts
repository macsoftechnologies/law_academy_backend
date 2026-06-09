import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { AdminTicketsController, TicketController } from './ticket.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './schema/ticket.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
    ]),
  ],
  controllers: [TicketController, AdminTicketsController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule { }
