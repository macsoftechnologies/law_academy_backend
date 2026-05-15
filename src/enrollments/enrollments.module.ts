import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Enrollment, enrollmentSchema } from './schema/enrollment.schema';
import { Plan, planSchema } from 'src/plans/schema/plans.schema';
import { BillingsModule } from 'src/billing/billing.module';
import { Coupon, couponSchema } from 'src/coupons/schema/coupon.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: enrollmentSchema },
      { name: Plan.name, schema: planSchema },
      { name: Coupon.name, schema: couponSchema },
    ]),
    BillingsModule,
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
