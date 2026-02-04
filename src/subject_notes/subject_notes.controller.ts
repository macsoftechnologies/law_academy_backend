import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { SubjectNotesService } from './subject_notes.service';
import { subjectNotesDto } from './dto/subject_notes.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('subject-notes')
export class SubjectNotesController {
  constructor(private readonly subjectNotesService: SubjectNotesService) {}

  @Post('/add')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: {
        fileSize: 4 * 1024 * 1024,
      },
      storage: diskStorage({
        destination: './files',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async addsubjectnotes(@Body() req: subjectNotesDto, @UploadedFiles() image) {
    try {
      const add = await this.subjectNotesService.addSubjectNotes(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Get('/')
  async getSubjectNotes(
    @Query('page') page = 10,
    @Query('limit') limit = 10
  ) {
    try {
      const getlist = await this.subjectNotesService.getSubjectNotesList(
        Number(page),
        Number(limit),
      );
      return getlist;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/notesbylaw')
  async subjectNotesByLaw(@Body() req: subjectNotesDto) {
    try {
      const list = await this.subjectNotesService.notesByLaw(req);
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/update')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: {
        fileSize: 4 * 1024 * 1024,
      },
      storage: diskStorage({
        destination: './files',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async updatesubjectnotes(
    @Body() req: subjectNotesDto,
    @UploadedFiles() image,
  ) {
    try {
      const add = await this.subjectNotesService.editSubjectNotes(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/delete')
  async removeDelete(@Body() req: subjectNotesDto) {
    try {
      const removenotes =
        await this.subjectNotesService.deleteSubjectNotes(req);
      return removenotes;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
