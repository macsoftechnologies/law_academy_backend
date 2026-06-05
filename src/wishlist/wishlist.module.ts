import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { WishlistItem, WishlistItemSchema } from './schema/wishlist-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WishlistItem.name, schema: WishlistItemSchema },
    ]),
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService, MongooseModule],
})
export class WishlistModule {}
