import { Module } from '@nestjs/common';
import { PrelimesService } from './prelimes.service';
import { PrelimesController } from './prelimes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Prelimes, prelimesSchema } from './schema/prelimes.schema';
import { Enrollment, enrollmentSchema } from 'src/enrollments/schema/enrollment.schema';
import { MockTestSubject, mockTestSubjectSchema } from './schema/subject-wise-mock-test.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prelimes.name, schema: prelimesSchema },
      { name: Enrollment.name, schema: enrollmentSchema },
      { name: MockTestSubject.name, schema: mockTestSubjectSchema },
    ]),
  ],
  controllers: [PrelimesController],
  providers: [PrelimesService],
})
export class PrelimesModule {}
