import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InAppNotification } from './schema/notification.schema';
import { User } from '../users/schemas/user.schema';
import { ListNotificationsDto, MarkReadDto, DeleteNotificationDto, CreateAdminNotificationDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(InAppNotification.name) private readonly notificationModel: Model<InAppNotification>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  /**
   * Internal helper to create a single notification.
   */
  async create(userId: string, title: string, message: string, type: string, metadata?: Record<string, any>) {
    try {
      return await this.notificationModel.create({
        userId,
        title,
        message,
        type,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error creating notification:', error.message || error);
    }
  }

  /**
   * Internal helper to broadcast a notification to all users.
   */
  async broadcast(title: string, message: string, type: string, metadata?: Record<string, any>) {
    try {
      const users = await this.userModel.find({}, 'userId');
      const creations = users.map(user => ({
        userId: user.userId,
        title,
        message,
        type,
        metadata: metadata || {},
      }));

      if (creations.length > 0) {
        await this.notificationModel.insertMany(creations);
      }
    } catch (error) {
      console.error('Error broadcasting notification:', error.message || error);
    }
  }

  /**
   * List notifications for a user.
   */
  async listNotifications(dto: ListNotificationsDto) {
    try {
      const { userId, limit = 20, skip = 0 } = dto;

      const user = await this.userModel.findOne({ userId });
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      const query = { userId };
      const items = await this.notificationModel.find(query)
        .sort({ createdAt: -1 })

      const total = await this.notificationModel.countDocuments(query);
      const unreadCount = await this.notificationModel.countDocuments({ userId, isRead: false });

      return {
        statusCode: HttpStatus.OK,
        message: 'Notifications retrieved successfully',
        data: {
          items,
          unreadCount,
          total,
        },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  /**
   * Mark notifications as read.
   */
  async markAsRead(dto: MarkReadDto) {
    try {
      const { userId, notificationId } = dto;

      const user = await this.userModel.findOne({ userId });
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      if (notificationId) {
        const result = await this.notificationModel.findOneAndUpdate(
          { userId, notificationId },
          { isRead: true, readAt: new Date() },
          { new: true }
        );

        if (!result) {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Notification not found',
          };
        }

        return {
          statusCode: HttpStatus.OK,
          message: 'Notification marked as read successfully',
          data: result,
        };
      } else {
        await this.notificationModel.updateMany(
          { userId, isRead: false },
          { isRead: true, readAt: new Date() }
        );

        return {
          statusCode: HttpStatus.OK,
          message: 'All notifications marked as read successfully',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  /**
   * Delete a notification.
   */
  async deleteNotification(dto: DeleteNotificationDto) {
    try {
      const { userId, notificationId } = dto;

      const result = await this.notificationModel.findOneAndDelete({ userId, notificationId });
      if (!result) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Notification not found',
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Notification deleted successfully',
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  /**
   * Create notification from admin panel.
   */
  async createAdminNotification(dto: CreateAdminNotificationDto) {
    try {
      const { title, message, type = 'announcement', userId } = dto;

      if (userId) {
        const userIds = Array.isArray(userId) ? userId : [userId];

        if (userIds.length === 0) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'No valid user ID(s) provided',
          };
        }

        const validUsers = await this.userModel.find({ userId: { $in: userIds } }, 'userId');
        if (validUsers.length === 0) {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'No valid users found for the provided ID(s)',
          };
        }

        const creations = validUsers.map(user => ({
          userId: user.userId,
          title,
          message,
          type,
          metadata: {},
        }));

        const results = await this.notificationModel.insertMany(creations);

        return {
          statusCode: HttpStatus.OK,
          message: `Notification sent successfully to ${validUsers.length} user(s)`,
          data: results,
        };
      } else {
        await this.broadcast(title, message, type);
        return {
          statusCode: HttpStatus.OK,
          message: 'Broadcast notification sent successfully to all users',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }
}
