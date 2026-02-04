import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notes, NotesSchema } from './schema/notes.schema';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import {
  Enrollment,
  enrollmentSchema,
} from 'src/enrollments/schema/enrollment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notes.name, schema: NotesSchema },
      { name: Enrollment.name, schema: enrollmentSchema },
    ]),
  ],
  controllers: [NotesController],
  providers: [NotesService, AuthService, JwtService],
})
export class NotesModule {}
