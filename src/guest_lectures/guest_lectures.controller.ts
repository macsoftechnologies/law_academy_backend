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
import { GuestLecturesService } from './guest_lectures.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { guestLectureDto } from './dto/guest_lecture.dto';

@Controller('guest-lectures')
export class GuestLecturesController {
  constructor(private readonly guestLecturesService: GuestLecturesService) {}

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
  async addGuestLecture(@Body() req: guestLectureDto, @UploadedFiles() image) {
    try {
      const add = await this.guestLecturesService.addGuestLecture(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Get('/')
  async getGuestLectures(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const list = await this.guestLecturesService.getGuestLecturesList(
        Number(page),
        Number(limit),
      );
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/details')
  async guestLectureDetails(@Body() req: guestLectureDto) {
    try {
      const details = await this.guestLecturesService.getGuestLectureById(req);
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
  async editGuestLecture(@Body() req: guestLectureDto, @UploadedFiles() image) {
    try {
      const editlecture = await this.guestLecturesService.editGuestLecture(req, image);
      return editlecture;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/delete')
  async removeLecture(@Body() req: guestLectureDto) {
    try {
      const remove = await this.guestLecturesService.deleteGuestLecture(req);
      return remove;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
