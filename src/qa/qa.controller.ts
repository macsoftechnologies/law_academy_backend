import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { QaService } from './qa.service';
import { qaDto } from './dto/qa.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { error } from 'console';

@Controller('qa')
export class QaController {
  constructor(private readonly qaService: QaService) {}

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
  async createQAs(@Body() req: qaDto, @UploadedFiles() image) {
    try {
      const add = await this.qaService.addQA(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Post('module/:userId')
  async getQAByModule(
    @Param('userId') userId: string,
    @Body() body: qaDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const list = await this.qaService.getQAByModule(
        body,
        userId,
        page,
        limit,
      );
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('details')
  async getQAById(@Body() req: qaDto) {
    try {
      const list = await this.qaService.getQAById(req);
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('update')
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
  async updateQA(@Body() req: qaDto, @UploadedFiles() image) {
    try {
      const moderate = await this.qaService.updateQA(req, image);
      return moderate;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Post('delete')
  async removeQA(@Body() req: qaDto) {
    try {
      const remove = await this.qaService.deleteQA(req);
      return remove;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }
}
