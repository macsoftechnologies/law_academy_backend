import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, bannerSchema } from './schema/banner.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Banner.name, schema: bannerSchema}])],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}
