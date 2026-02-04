import { Body, Controller, Get, HttpStatus, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { lectureDto } from './dto/lecture.dto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('lectures')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Post('/add')
  async addLecture(@Body() req: lectureDto) {
    try {
      const add = await this.lecturesService.createLecture(req);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Get('/')
  async getLectures(
    @Query('page') page: Number,
    @Query('limit') limit: Number,
  ) {
    try {
      const getlist = await this.lecturesService.getLectures(
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

  @Post('/details')
  async getLectureDetails(@Body() req: lectureDto) {
    try{
      const list = await this.lecturesService.getLectureDetails(req);
      return list
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getbysubject')
  async getLecturesBySubject(@Body() req: lectureDto) {
    try{
      const list = await this.lecturesService.getLecturesBySubject(req);
      return list
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/update')
  async updateLecture(@Body() req: lectureDto) {
    try{
      const updatelecture = await this.lecturesService.editLecture(req);
      return updatelecture
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/delete')
  async removeLecture(@Body() req: lectureDto) {
    try{
      const remove = await this.lecturesService.deleteLecture(req);
      return remove
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}
