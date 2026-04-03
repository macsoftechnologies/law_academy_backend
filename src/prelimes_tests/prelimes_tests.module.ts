import { Module } from '@nestjs/common';
import { PrelimesTestsService } from './prelimes_tests.service';
import { PrelimesTestsController } from './prelimes_tests.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PrelimesTest,
  prelimesTestSchema,
} from './schema/prelimes_tests.schema';
import { PrelimesAttempt, prelimesAttemptSchema } from './schema/prelimes_attempts.schema';
import { PrelimesQuestion, prelimesQuestionSchema } from './schema/prelimes_questions.schema';
import { PrelimesResults, prelimesResultSchema } from './schema/prelimes_results.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrelimesTest.name, schema: prelimesTestSchema },
      { name: PrelimesAttempt.name, schema: prelimesAttemptSchema },
      { name: PrelimesQuestion.name, schema: prelimesQuestionSchema },
      { name: PrelimesResults.name, schema: prelimesResultSchema },
    ]),
  ],
  controllers: [PrelimesTestsController],
  providers: [PrelimesTestsService],
})
export class PrelimesTestsModule {}
