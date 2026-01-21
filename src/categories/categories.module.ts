import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, categorySchema } from './schema/category.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Category.name, schema: categorySchema}])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
