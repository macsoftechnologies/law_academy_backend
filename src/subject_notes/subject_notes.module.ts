import { Module } from '@nestjs/common';
import { SubjectNotesService } from './subject_notes.service';
import { SubjectNotesController } from './subject_notes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { subjectNoteSchema, SubjectNotes } from './schema/subject_notes.schema';
import { Enrollment, enrollmentSchema } from 'src/enrollments/schema/enrollment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubjectNotes.name, schema: subjectNoteSchema },
      { name: Enrollment.name, schema: enrollmentSchema },
    ]),
  ],
  controllers: [SubjectNotesController],
  providers: [SubjectNotesService],
})
export class SubjectNotesModule {}
