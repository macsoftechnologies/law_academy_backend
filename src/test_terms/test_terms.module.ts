import { Module } from '@nestjs/common';
import { TestTermsService } from './test_terms.service';
import { TestTermsController } from './test_terms.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TestTerms, testTermsSchema } from './schema/test_terms.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: TestTerms.name, schema: testTermsSchema}])],
  controllers: [TestTermsController],
  providers: [TestTermsService],
})
export class TestTermsModule {}
