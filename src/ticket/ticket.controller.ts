import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AddMessageDto, AdminTicketListDto, MarkMessagesReadDto, ScheduleCallDto, TicketDetailsDto, UpdateStatusDto, UserTicketListDto, UpdateCallStatusDto } from './dto/ticket.dto';
import { Roles } from 'src/auth/guards/roles.decorator';
import { Role } from 'src/auth/guards/roles.enum';

// ─────────────────────────────────────────────
// STUDENT ENDPOINTS
// ─────────────────────────────────────────────
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketsService: TicketService) { }

  /**
   * POST /tickets/create
   * Create a new support ticket
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createTicket(@Body() dto: CreateTicketDto) {
    const ticket = await this.ticketsService.createTicket(dto);
    return {
      success: true,
      message: 'Ticket created successfully',
      data: ticket,
    };
  }

  /**
   * POST /tickets/user-list
   * Get all tickets for a student (paginated, filterable by status)
   */
  @Post('user-list')
  @HttpCode(HttpStatus.OK)
  async getUserTickets(@Body() dto: UserTicketListDto) {
    const result = await this.ticketsService.getUserTickets(dto);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * POST /tickets/details
   * Get full ticket details including conversation thread for a student
   */
  @Post('details')
  @HttpCode(HttpStatus.OK)
  async getTicketDetails(@Body() dto: TicketDetailsDto) {
    const ticket = await this.ticketsService.getTicketDetails(dto.ticketId, dto.userId);
    return {
      success: true,
      data: ticket,
    };
  }

  /**
   * POST /tickets/add-message
   * Student adds a message to the conversation thread
   */
  @Post('add-message')
  @HttpCode(HttpStatus.OK)
  async addStudentMessage(@Body() dto: AddMessageDto) {
    // In production, senderName comes from the JWT-authenticated user
    const senderName = 'Student';
    const ticket = await this.ticketsService.addStudentMessage(dto, senderName);
    return {
      success: true,
      message: 'Message sent',
      data: ticket,
    };
  }

  /**
   * POST /tickets/schedule-call
   * Student schedules a callback
   */
  @Post('schedule-call')
  @HttpCode(HttpStatus.OK)
  async scheduleCall(@Body() dto: ScheduleCallDto) {
    const ticket = await this.ticketsService.scheduleCallback(dto, dto.userId);
    return {
      success: true,
      message: 'Call scheduled',
      data: ticket,
    };
  }

  /**
   * POST /tickets/mark-read
   * Mark all messages as read for a user (student side)
   */
  @Post('mark-read')
  @HttpCode(HttpStatus.OK)
  async markRead(@Body() dto: MarkMessagesReadDto) {
    await this.ticketsService.markMessagesRead(dto.ticketId, dto.userId, false);
    return { success: true, message: 'Messages marked as read' };
  }
}

// ─────────────────────────────────────────────
// ADMIN / TEACHER / SUPPORT ENDPOINTS
// ─────────────────────────────────────────────
@Controller('tickets/admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN, Role.TEACHER, Role.SUPPORTADMIN)
export class AdminTicketsController {
  constructor(private readonly ticketsService: TicketService) { }

  /**
   * GET /tickets/admin/list
   * Returns tickets filtered by the caller's role:
   *   - admin/superadmin → all tickets
   *   - teacher          → only course tickets
   *   - support/supportadmin → only support tickets
   */
  @Get('list')
  async getAdminTickets(@Req() req: any, @Query() query: AdminTicketListDto) {
    const result = await this.ticketsService.getAdminTickets(req.user, query);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * GET /tickets/admin/details/:ticketId
   * Get full ticket including conversation thread (role-checked)
   */
  @Get('details/:ticketId')
  async getAdminTicketDetails(@Param('ticketId') ticketId: string, @Req() req: any) {
    const ticket = await this.ticketsService.getAdminTicketDetails(ticketId, req.user);
    return {
      success: true,
      data: ticket,
    };
  }

  /**
   * POST /tickets/admin/add-message
   * Admin/teacher/support replies to a ticket conversation (role-checked)
   */
  @Post('add-message')
  @HttpCode(HttpStatus.OK)
  async addAdminMessage(@Body() dto: AddMessageDto, @Req() req: any) {
    // Override senderId with authenticated admin's id
    const enrichedDto = { ...dto, senderId: req.user.id };
    const ticket = await this.ticketsService.addAdminMessage(enrichedDto, req.user);
    return {
      success: true,
      message: 'Reply sent',
      data: ticket,
    };
  }

  /**
   * POST /tickets/admin/update-status
   * Update ticket status (role-checked)
   */
  @Post('update-status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(@Body() dto: UpdateStatusDto, @Req() req: any) {
    const ticket = await this.ticketsService.updateStatus(dto, req.user);
    return {
      success: true,
      message: 'Status updated',
      data: ticket,
    };
  }

  /**
   * POST /tickets/admin/assign
   * Assign a ticket to a staff member (admin/superadmin only)
   */
  @Post('assign')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  async assignTicket(
    @Body() body: { ticketId: string; assigneeId: string },
    @Req() req: any,
  ) {
    const ticket = await this.ticketsService.assignTicket(
      body.ticketId,
      body.assigneeId,
      req.user,
    );
    return { success: true, message: 'Ticket assigned', data: ticket };
  }

  /**
   * POST /tickets/admin/mark-read
   * Mark messages as read (admin side)
   */
  @Post('mark-read')
  @HttpCode(HttpStatus.OK)
  async markRead(@Body() dto: MarkMessagesReadDto, @Req() req: any) {
    await this.ticketsService.markMessagesRead(dto.ticketId, req.user.id, true);
    return { success: true, message: 'Messages marked as read' };
  }

  /**
   * DELETE /tickets/admin/:ticketId/message/:messageId
   * Soft-delete a message from the conversation
   */
  @Delete(':ticketId/message/:messageId')
  async deleteMessage(
    @Param('ticketId') ticketId: string,
    @Param('messageId') messageId: string,
    @Req() req: any,
  ) {
    const ticket = await this.ticketsService.deleteMessage(ticketId, messageId, req.user);
    return { success: true, message: 'Message deleted', data: ticket };
  }

  /**
   * POST /tickets/admin/update-call-status
   * Update scheduled call status (role-checked)
   */
  @Post('update-call-status')
  @HttpCode(HttpStatus.OK)
  async updateCallStatus(@Body() dto: UpdateCallStatusDto, @Req() req: any) {
    const ticket = await this.ticketsService.updateCallStatus(dto, req.user);
    return {
      success: true,
      message: 'Call status updated',
      data: ticket,
    };
  }
}