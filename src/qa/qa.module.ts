import { Module } from '@nestjs/common';
import { QaService } from './qa.service';
import { QaController } from './qa.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { QAModule, QASchema } from './schema/qa.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: QAModule.name, schema: QASchema }]),
  ],
  controllers: [QaController],
  providers: [QaService],
})
export class QaModule {}
