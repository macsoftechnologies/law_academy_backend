import { Module } from '@nestjs/common';
import { GuestLecturesService } from './guest_lectures.service';
import { GuestLecturesController } from './guest_lectures.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GuestLecture,
  guestLectureSchema,
} from './schema/guest_lecture.schema';
import {
  Enrollment,
  enrollmentSchema,
} from 'src/enrollments/schema/enrollment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GuestLecture.name, schema: guestLectureSchema },
      { name: Enrollment.name, schema: enrollmentSchema },
    ]),
  ],
  controllers: [GuestLecturesController],
  providers: [GuestLecturesService],
})
export class GuestLecturesModule {}
