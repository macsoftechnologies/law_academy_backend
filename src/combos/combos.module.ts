import { Module } from '@nestjs/common';
import { CombosService } from './combos.service';
import { CombosController } from './combos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ComboEnrollment, comboEnrollmentSchema } from './schema/combo-enrollment.schema';
import { Combo, comboSchema } from './schema/combo.schema';
import { Plan, planSchema } from 'src/plans/schema/plans.schema';
import { Lecture, lectureSchema } from 'src/lectures/schema/lecture.schema';
import { Subject, subjectSchema } from 'src/subjects/schema/subject.schema';
import { Notes, NotesSchema } from 'src/notes/schema/notes.schema';
import { Prelimes, prelimesSchema } from 'src/prelimes/schema/prelimes.schema';
import { Mains, mainsSchema } from 'src/mains/schema/mains.schema';
import { Enrollment, enrollmentSchema } from 'src/enrollments/schema/enrollment.schema';
import { SubjectNotes, subjectNoteSchema } from 'src/subject_notes/schema/subject_notes.schema';
import { Law, lawSchema } from 'src/laws/schema/laws.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Combo.name, schema: comboSchema },
    { name: Enrollment.name, schema: enrollmentSchema },
    { name: Plan.name, schema: planSchema },
    { name: Lecture.name, schema: lectureSchema },
    { name: Subject.name, schema: subjectSchema },
    { name: Notes.name, schema: NotesSchema },
    { name: Prelimes.name, schema: prelimesSchema },
    { name: Mains.name, schema: mainsSchema },
    { name: SubjectNotes.name, schema: subjectNoteSchema },
    { name: Law.name, schema: lawSchema },
  ])],
  controllers: [CombosController],
  providers: [CombosService],
})
export class CombosModule {}
