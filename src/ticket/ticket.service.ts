import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTicketDto } from './dto/create-ticket.dto';
import {
    AddMessageDto,
    UpdateStatusDto,
    ScheduleCallDto,
    UserTicketListDto,
    AdminTicketListDto,
    UpdateCallStatusDto,
} from './dto/ticket.dto';
import { Ticket, TicketDocument, TicketStatus, TicketType, CallStatus } from './schema/ticket.schema';
import { User } from 'src/users/schemas/user.schema';

// Roles allowed to act on each ticket type
const COURSE_TICKET_ROLES = ['admin', 'superadmin', 'teacher'];
const SUPPORT_TICKET_ROLES = ['admin', 'superadmin', 'support', 'supportadmin'];

@Injectable()
export class TicketService {
    constructor(
        @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    private canAccessTicket(ticketType: TicketType, userRole: string): boolean {
        if (ticketType === TicketType.COURSE) {
            return COURSE_TICKET_ROLES.includes(userRole);
        }
        if (ticketType === TicketType.SUPPORT) {
            return SUPPORT_TICKET_ROLES.includes(userRole);
        }
        return false;
    }

    private getTicketTypeFilterForRole(role: string): TicketType | null {
        if (role === 'admin' || role === 'superadmin') return null; // no filter = all
        if (role === 'teacher') return TicketType.COURSE;
        if (role === 'support' || role === 'supportadmin') return TicketType.SUPPORT;
        return null;
    }

    // ─────────────────────────────────────────────
    // STUDENT ENDPOINTS
    // ─────────────────────────────────────────────

    async createTicket(dto: CreateTicketDto): Promise<TicketDocument> {
        const ticket = new this.ticketModel({
            userId: dto.userId,
            title: dto.title,
            description: dto.description,
            ticket_type: dto.ticket_type,
            status: TicketStatus.PENDING,
        });
        return ticket.save();
    }

    async getUserTickets(dto: UserTicketListDto) {
        const { userId, status, page = 1, limit = 10 } = dto;
        const query: any = {
            userId,
        };
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const [tickets, total] = await Promise.all([
            this.ticketModel
                .find(query)
                .select('-messages')
                .sort({ lastMessageAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.ticketModel.countDocuments(query),
        ]);

        return {
            tickets,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getTicketDetails(ticketId: string, userId: string): Promise<TicketDocument> {
        const ticket = await this.ticketModel.findOne({
            ticketId: ticketId,
            userId: userId,
        });
        if (!ticket) throw new NotFoundException('Ticket not found');
        return ticket;
    }

    async addStudentMessage(dto: AddMessageDto, senderName: string): Promise<TicketDocument> {
        const ticket = await this.ticketModel.findOne({
            ticketId: dto.ticketId,
            userId: dto.senderId,
        });
        if (!ticket) throw new NotFoundException('Ticket not found or access denied');
        if (ticket.status === TicketStatus.CLOSED) {
            throw new BadRequestException('Cannot reply to a closed ticket');
        }

        const newMessage = {
            ticketId: ticket.ticketId,
            senderId: dto.senderId,
            senderName,
            senderRole: 'student',
            message: dto.message,
            readBy: [{ userId: dto.senderId, readAt: new Date() }],
            isDeleted: false,
            createdAt: new Date(),
        };

        ticket.messages.push(newMessage as any);
        ticket.lastMessageAt = new Date();
        ticket.unreadCountAdmin += 1;

        if (ticket.status === TicketStatus.RESOLVED) {
            ticket.status = TicketStatus.IN_PROGRESS;
        }

        return ticket.save();
    }

    async scheduleCallback(dto: ScheduleCallDto, userId: string): Promise<TicketDocument> {
        const ticket = await this.ticketModel.findOne({
            ticketId: dto.ticketId,
            userId: userId,
        });
        if (!ticket) throw new NotFoundException('Ticket not found');
        if (ticket.status === TicketStatus.CLOSED) {
            throw new BadRequestException('Cannot schedule a call on a closed ticket');
        }

        ticket.callScheduled = true;
        ticket.callScheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : new Date();
        ticket.callStatus = CallStatus.PENDING;
        return ticket.save();
    }

    async markMessagesRead(ticketId: string, userId: string, isAdmin: boolean): Promise<void> {
        const ticket = await this.ticketModel.findOne({ ticketId });
        if (!ticket) throw new NotFoundException('Ticket not found');

        const userObjectId = userId;
        const now = new Date();

        // Mark all messages not already read by this user
        let changed = false;
        for (const msg of ticket.messages) {
            const alreadyRead = msg.readBy.some((r) => r.userId === userObjectId);
            if (!alreadyRead) {
                msg.readBy.push({ userId: userObjectId, readAt: now });
                changed = true;
            }
        }

        if (changed) {
            if (isAdmin) {
                ticket.unreadCountAdmin = 0;
            } else {
                ticket.unreadCountStudent = 0;
            }
            await ticket.save();
        }
    }

    // ─────────────────────────────────────────────
    // ADMIN / TEACHER / SUPPORT ENDPOINTS
    // ─────────────────────────────────────────────

    async getAdminTickets(user: any, dto: AdminTicketListDto) {
        const { status, page = 1, limit = 10, search } = dto;
        const query: any = {};

        const typeFilter = this.getTicketTypeFilterForRole(user.role);
        if (typeFilter) query.ticket_type = typeFilter;

        if (status) query.status = status;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const [tickets, total] = await Promise.all([
            this.ticketModel
                .find(query)
                .select('-messages')
                .sort({ unreadCountAdmin: -1, lastMessageAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.ticketModel.countDocuments(query),
        ]);

        const userIds = [...new Set(tickets.map((t) => t.userId).filter(Boolean))];
        const users = await this.userModel
            .find({ userId: { $in: userIds } })
            .select('userId name email mobile_number')
            .lean();

        const userMap = new Map(users.map((u) => [u.userId, u]));

        const ticketsWithUser = tickets.map((ticket) => ({
            ...ticket,
            student: userMap.get(ticket.userId) || null,
        }));

        return {
            tickets: ticketsWithUser,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getAdminTicketDetails(ticketId: string, user: any): Promise<any> {
        const ticket = await this.ticketModel.findOne({ ticketId }).lean();
        if (!ticket) throw new NotFoundException('Ticket not found');

        if (!this.canAccessTicket(ticket.ticket_type, user.role)) {
            throw new ForbiddenException(
                `Your role (${user.role}) is not permitted to view ${ticket.ticket_type} tickets`,
            );
        }

        const student = await this.userModel
            .findOne({ userId: ticket.userId })
            .select('userId name email mobile_number')
            .lean();

        return { ...ticket, student: student || null };
    }

    async addAdminMessage(dto: AddMessageDto, user: any): Promise<TicketDocument> {
        const ticket = await this.ticketModel.findOne({ ticketId: dto.ticketId });
        if (!ticket) throw new NotFoundException('Ticket not found');

        if (!this.canAccessTicket(ticket.ticket_type, user.role)) {
            throw new ForbiddenException(
                `Your role (${user.role}) is not permitted to reply to ${ticket.ticket_type} tickets`,
            );
        }
        if (ticket.status === TicketStatus.CLOSED) {
            throw new BadRequestException('Cannot reply to a closed ticket');
        }

        const newMessage = {
            _id: new Types.ObjectId(),
            senderId: dto.senderId,
            senderName: user.name || user.email || user.emailId || 'Admin',
            senderRole: user.role,
            message: dto.message,
            readBy: [{ userId: dto.senderId, readAt: new Date() }],
            isDeleted: false,
            createdAt: new Date(),
        };

        ticket.messages.push(newMessage as any);
        ticket.lastMessageAt = new Date();
        ticket.unreadCountStudent += 1;

        if (ticket.status === TicketStatus.PENDING) {
            ticket.status = TicketStatus.IN_PROGRESS;
        }

        return ticket.save();
    }

    async updateStatus(dto: UpdateStatusDto, user: any): Promise<TicketDocument> {
        const ticket = await this.ticketModel.findOne({ ticketId: dto.ticketId });
        if (!ticket) throw new NotFoundException('Ticket not found');

        if (!this.canAccessTicket(ticket.ticket_type, user.role)) {
            throw new ForbiddenException(
                `Your role (${user.role}) is not permitted to update ${ticket.ticket_type} tickets`,
            );
        }

        ticket.status = dto.status;
        if (dto.status === TicketStatus.RESOLVED) ticket.resolvedAt = new Date();
        if (dto.status === TicketStatus.CLOSED) ticket.closedAt = new Date();

        return ticket.save();
    }

    async assignTicket(ticketId: string, assigneeId: string, user: any): Promise<TicketDocument> {
        const ticket = await this.ticketModel.findOne({ ticketId });
        if (!ticket) throw new NotFoundException('Ticket not found');

        if (!this.canAccessTicket(ticket.ticket_type, user.role)) {
            throw new ForbiddenException(
                `Your role (${user.role}) is not permitted to assign ${ticket.ticket_type} tickets`,
            );
        }

        ticket.assignedTo = assigneeId;
        return ticket.save();
    }

    async deleteMessage(ticketId: string, messageId: string, user: any): Promise<TicketDocument> {
        const ticket = await this.ticketModel.findOne({ ticketId });
        if (!ticket) throw new NotFoundException('Ticket not found');

        if (!this.canAccessTicket(ticket.ticket_type, user.role)) {
            throw new ForbiddenException('Access denied');
        }

        const msg = ticket.messages.find((m: any) => m._id.equals(new Types.ObjectId(messageId)));
        if (!msg) throw new NotFoundException('Message not found');

        // Only admin/superadmin can delete any message; others can only delete their own
        const isOwn = msg.senderId === user.id;
        const isSuperRole = ['admin', 'superadmin'].includes(user.role);
        if (!isOwn && !isSuperRole) {
            throw new ForbiddenException('You can only delete your own messages');
        }

        msg.isDeleted = true;
        msg.message = '[Message deleted]';
        return ticket.save();
    }

    async updateCallStatus(dto: UpdateCallStatusDto, user: any): Promise<TicketDocument> {
        const ticket = await this.ticketModel.findOne({ ticketId: dto.ticketId });
        if (!ticket) throw new NotFoundException('Ticket not found');

        if (!this.canAccessTicket(ticket.ticket_type, user.role)) {
            throw new ForbiddenException(
                `Your role (${user.role}) is not permitted to update call status on ${ticket.ticket_type} tickets`,
            );
        }

        ticket.callStatus = dto.callStatus;
        if (dto.callStatus === CallStatus.COMPLETED || dto.callStatus === CallStatus.MISSED) {
            ticket.callScheduled = false;
        } else if (dto.callStatus === CallStatus.PENDING) {
            ticket.callScheduled = true;
        } else if (dto.callStatus === CallStatus.NONE) {
            ticket.callScheduled = false;
            ticket.callScheduledAt = null;
        }

        return ticket.save();
    }
}