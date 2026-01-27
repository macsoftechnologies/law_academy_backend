import { Body, Controller, Get, HttpStatus, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { LawsService } from './laws.service';
import { lawsDto } from './dto/laws.dto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('laws')
export class LawsController {
  constructor(private readonly lawsService: LawsService) {}

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
  async addlaw(@Body() req: lawsDto, @UploadedFiles() image) {
    try{
      const add = await this.lawsService.addLaw(req, image);
      return add
    } catch(error){
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Get('/')
  async getLaws(@Query('page') page = 1, @Query('limit') limit = 10) {
    try{
      const getlist = await this.lawsService.getLaws(
        Number(page),
        Number(limit)
      );
      return getlist
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/listbysubcategory')
  async getLawsBySubCategory(@Body() req: lawsDto) {
    try{
      const list = await this.lawsService.getBySubCategory(req);
      return list
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
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
  async updatelaw(@Body() req: lawsDto, @UploadedFiles() image) {
    try{
      const add = await this.lawsService.editLaw(req, image);
      return add
    } catch(error){
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/delete')
  async deletelaw(@Body() req: lawsDto) {
    try{
      const list = await this.lawsService.deleteLaw(req);
      return list
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}
