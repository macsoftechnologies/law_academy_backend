import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { AdminTicketsController, TicketController } from './ticket.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './schema/ticket.schema';
import { User, userSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: User.name, schema: userSchema },
    ]),
  ],
  controllers: [TicketController, AdminTicketsController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule { }
