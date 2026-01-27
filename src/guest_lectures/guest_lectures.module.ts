import { Module } from '@nestjs/common';
import { GuestLecturesService } from './guest_lectures.service';
import { GuestLecturesController } from './guest_lectures.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GuestLecture, guestLectureSchema } from './schema/guest_lecture.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: GuestLecture.name, schema: guestLectureSchema}])],
  controllers: [GuestLecturesController],
  providers: [GuestLecturesService],
})
export class GuestLecturesModule {}
