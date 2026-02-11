import { Module } from '@nestjs/common';
import { MainsService } from './mains.service';
import { MainsController } from './mains.controller';
import { Mains, mainsSchema } from './schema/mains.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Enrollment,
  enrollmentSchema,
} from 'src/enrollments/schema/enrollment.schema';
import { MainsTest, mainsTestSchema } from './schema/mains-test.schema';
import { MainsSubjectTest, mainsSubjectTestSchema } from './schema/mains-subject-test.schema';
import { MainsAttempts, mainsAttemptSchema } from './schema/mains_attempts.schema';
import { MainsResults, mainsResultSchema } from './schema/mains-test-results.schema';
import { BunnyService } from 'src/auth/bunny.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Mains.name, schema: mainsSchema },
      { name: Enrollment.name, schema: enrollmentSchema },
      { name: MainsTest.name, schema: mainsTestSchema },
      { name: MainsSubjectTest.name, schema: mainsSubjectTestSchema },
      { name: MainsAttempts.name, schema: mainsAttemptSchema },
      { name: MainsResults.name, schema: mainsResultSchema },
    ]),
  ],
  controllers: [MainsController],
  providers: [MainsService, BunnyService],
})
export class MainsModule {}
