import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Billing, BillingSchema } from './schema/billing.schema';
import { Enrollment, enrollmentSchema } from '../enrollments/schema/enrollment.schema';
import { BillingsController } from './billing.controller';
import { BillingsService } from './billing.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Billing.name, schema: BillingSchema },
      { name: Enrollment.name, schema: enrollmentSchema },
    ]),
  ],
  controllers: [BillingsController],
  providers: [BillingsService],
  exports: [BillingsService],
})
export class BillingsModule {}
