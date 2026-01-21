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
import { BannersService } from './banners.service';
import { bannerDto } from './dto/banner.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

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
  async addBanner(@Body() req: bannerDto, @UploadedFiles() image) {
    try {
      const addbanner = await this.bannersService.createBanner(req, image);
      return addbanner;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Get('/')
  async getBanners(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const getlist = await this.bannersService.getBannersList(
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

  @Post('/delete')
  async removeBanner(@Body() req: bannerDto) {
    try {
      const remove = await this.bannersService.deleteBanner(req);
      return remove;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
