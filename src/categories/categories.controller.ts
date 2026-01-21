import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { categoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('/add')
  async addcategory(@Body() req: categoryDto) {
    try{
      const add = await this.categoriesService.addCategory(req);
      return add
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Get('/')
  async getcategories() {
    try{
      const list = await this.categoriesService.getcategories();
      return list
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}
