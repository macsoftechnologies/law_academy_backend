import { ApiProperty } from '@nestjs/swagger';

export class ListNotificationsDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  limit?: number;

  @ApiProperty({ required: false })
  skip?: number;
}

export class MarkReadDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  notificationId?: string;
}

export class DeleteNotificationDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  notificationId: string;
}

export class CreateAdminNotificationDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false, default: 'announcement' })
  type?: string;

  @ApiProperty({ required: false, type: [String] })
  userId?: string[];
}
