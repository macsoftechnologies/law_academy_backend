import { HttpStatus, Injectable } from '@nestjs/common';
import { Category } from './schema/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { categoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async addCategory(req: categoryDto) {
    try {
      const addcategory = await this.categoryModel.create(req);
      if (addcategory) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Category added successfully',
          data: addcategory,
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'failed to add',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getcategories() {
    try {
      const getlist = await this.categoryModel.find();
      if (getlist.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of categories',
          data: getlist,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Categories not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
