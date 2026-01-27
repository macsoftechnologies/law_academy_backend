import { Body, Controller, Get, HttpStatus, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { subCategoryDto } from '../dto/subcategory.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

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
  async addSubCategory(@Body() req: subCategoryDto, @UploadedFiles() image) {
    try{
      const add = await this.subcategoriesService.addsubcategory(req, image)
      return add
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error
      }
    }
  }

  @Get('/')
  async getsubcategorieslist(@Query('page') page = 10, @Query('limit') limit = 10) {
    try{
      const getlist = await this.subcategoriesService.getSubCategories(
        Number(page),
        Number(limit)
      );
      return getlist
    } catch(error){
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getbycategory')
  async getSubCategoriesById(@Body() req: subCategoryDto) {
    try{
       const getlist = await this.subcategoriesService.getSubCategoriesByCategory(req);
       return getlist
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/details')
  async findcategory(@Body() req: subCategoryDto) {
    try {
      const findcategory = await this.subcategoriesService.getsubcategoryById(req);
      return findcategory;
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
  async updatesubcategory(@Body() req: subCategoryDto, @UploadedFiles() image) {
    try {
      const editcat = await this.subcategoriesService.updateSubCategory(req, image);
      return editcat;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/delete')
  async deletesubcategory(@Body() req: subCategoryDto) {
    try {
      const remove = await this.subcategoriesService.deleteSubCategory(req);
      return remove;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
