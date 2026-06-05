import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { ListNotificationsDto, MarkReadDto, DeleteNotificationDto, CreateAdminNotificationDto } from './dto/notifications.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('/list')
  async listNotifications(@Body() req: ListNotificationsDto) {
    try {
      const result = await this.notificationsService.listNotifications(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  @Post('/mark-read')
  async markAsRead(@Body() req: MarkReadDto) {
    try {
      const result = await this.notificationsService.markAsRead(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  @Post('/delete')
  async deleteNotification(@Body() req: DeleteNotificationDto) {
    try {
      const result = await this.notificationsService.deleteNotification(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  @Post('/create-admin')
  async createAdminNotification(@Body() req: CreateAdminNotificationDto) {
    try {
      const result = await this.notificationsService.createAdminNotification(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }
}
