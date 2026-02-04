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
import { NotesService } from './notes.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { notesDto } from './dto/notes.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('/add')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'presentation_image', maxCount: 1 },
      { name: 'printNotes_image', maxCount: 1 },
    ]),
  )
  async createNotes(@Body() req: notesDto, @UploadedFiles() image) {
    try {
      const add = await this.notesService.addNotes(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || "Internal server error",
      };
    }
  }

  @Get('/')
  async getNotes(@Query('page') page = 1, @Query('limit') limit = 10, @Query('userId') userId: string) {
    try {
      const getlist = await this.notesService.getNotesList(
        Number(page),
        Number(limit),
        String(userId),
      );
      return getlist;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/details')
  async getNoteDetails(@Body() req: notesDto) {
    try {
      const details = await this.notesService.getNotesById(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/update')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'presentation_image', maxCount: 1 },
      { name: 'printNotes_image', maxCount: 1 },
    ]),
  )
  async updateNotes(@Body() req: notesDto, @UploadedFiles() image) {
    try {
      const add = await this.notesService.editNotes(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/delete')
  async removeNotes(@Body() req: notesDto) {
    try {
      const remove = await this.notesService.deleteNotes(req);
      return remove;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
