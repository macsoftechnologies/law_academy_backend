import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, couponSchema } from './schema/coupon.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Coupon.name, schema: couponSchema}])],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
