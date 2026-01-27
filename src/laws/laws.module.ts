import { Module } from '@nestjs/common';
import { LawsService } from './laws.service';
import { LawsController } from './laws.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Law, lawSchema } from './schema/laws.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Law.name, schema: lawSchema}])],
  controllers: [LawsController],
  providers: [LawsService],
})
export class LawsModule {}
