import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, categorySchema } from './schema/category.schema';
import { SubcategoriesModule } from './subcategories/subcategories.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Category.name, schema: categorySchema}]), SubcategoriesModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
