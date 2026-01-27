import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, planSchema } from './schema/plans.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Plan.name, schema: planSchema}])],
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule {}
