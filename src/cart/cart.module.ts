import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartItem, CartItemSchema } from './schema/cart-item.schema';
import { Plan, planSchema } from 'src/plans/schema/plans.schema';
import { WishlistModule } from 'src/wishlist/wishlist.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CartItem.name, schema: CartItemSchema },
      { name: Plan.name, schema: planSchema },
    ]),
    WishlistModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
