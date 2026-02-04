import { Module } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LecturesController } from './lectures.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Lecture, lectureSchema } from './schema/lecture.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Lecture.name, schema: lectureSchema}])],
  controllers: [LecturesController],
  providers: [LecturesService],
})
export class LecturesModule {}
