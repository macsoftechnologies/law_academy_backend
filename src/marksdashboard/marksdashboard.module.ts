import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarksdashboardController } from './marksdashboard.controller';
import { MarksdashboardService } from './marksdashboard.service';

// Import Schemas
import { User, userSchema } from '../users/schemas/user.schema';
import { Enrollment, enrollmentSchema } from '../enrollments/schema/enrollment.schema';
import { Lecture, lectureSchema } from '../lectures/schema/lecture.schema';
import { SubjectNotes, subjectNoteSchema } from '../subject_notes/schema/subject_notes.schema';
import { Notes, NotesSchema } from '../notes/schema/notes.schema';
import { PrelimesTest, prelimesTestSchema } from '../prelimes_tests/schema/prelimes_tests.schema';
import { PrelimesResults, prelimesResultSchema } from '../prelimes_tests/schema/prelimes_results.schema';
import { MainsTest, mainsTestSchema } from '../mains/schema/mains-test.schema';
import { MainsSubjectTest, mainsSubjectTestSchema } from '../mains/schema/mains-subject-test.schema';
import { SubCategory, subCategorySchema } from '../categories/schema/subcategory.schema';
import { Subject, subjectSchema } from '../subjects/schema/subject.schema';
import { Law, lawSchema } from '../laws/schema/laws.schema';
import { UserProgress, UserProgressSchema } from './schema/user-progress.schema';
import { UserGoal, UserGoalSchema } from './schema/user-goal.schema';
import { Mains, mainsSchema } from '../mains/schema/mains.schema';
import { Prelimes, prelimesSchema } from '../prelimes/schema/prelimes.schema';
import { Combo, comboSchema } from '../combos/schema/combo.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: userSchema },
      { name: Enrollment.name, schema: enrollmentSchema },
      { name: Lecture.name, schema: lectureSchema },
      { name: SubjectNotes.name, schema: subjectNoteSchema },
      { name: Notes.name, schema: NotesSchema },
      { name: PrelimesTest.name, schema: prelimesTestSchema },
      { name: PrelimesResults.name, schema: prelimesResultSchema },
      { name: MainsTest.name, schema: mainsTestSchema },
      { name: MainsSubjectTest.name, schema: mainsSubjectTestSchema },
      { name: SubCategory.name, schema: subCategorySchema },
      { name: Subject.name, schema: subjectSchema },
      { name: Law.name, schema: lawSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: UserGoal.name, schema: UserGoalSchema },
      { name: Mains.name, schema: mainsSchema },
      { name: Prelimes.name, schema: prelimesSchema },
      { name: Combo.name, schema: comboSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [MarksdashboardController],
  providers: [MarksdashboardService],
  exports: [MarksdashboardService],
})
export class MarksdashboardModule {}
