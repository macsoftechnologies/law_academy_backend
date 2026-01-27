import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Enrollment, enrollmentSchema } from './schema/enrollment.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Enrollment.name, schema: enrollmentSchema}])],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
