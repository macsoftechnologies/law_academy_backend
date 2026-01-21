import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Banner } from './schema/banner.schema';
import { Model } from 'mongoose';
import { bannerDto } from './dto/banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name) private readonly bannerModel: Model<Banner>,
  ) {}

  async createBanner(req: bannerDto, image) {
    try {
      if (image) {
        const reqDoc = image.map((doc, index) => {
          let IsPrimary = false;
          if (index == 0) {
            IsPrimary = true;
          }
          const randomNumber = Math.floor(Math.random() * 1000000 + 1);
          return doc.filename;
        });

        req.banner_file = reqDoc.toString();
      }
      const addbanner = await this.bannerModel.create(req);
      if (addbanner) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Banner added successfully',
          data: addbanner,
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to add Banner',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getBannersList(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const [getList, totalCount] = await Promise.all([
        this.bannerModel.find().skip(skip).limit(limit),
        this.bannerModel.countDocuments(),
      ]);
      return {
        statusCode: HttpStatus.OK,
        message: 'List of Banners',
        totalCount: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
        data: getList,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async deleteBanner(req: bannerDto) {
    try {
      const remove = await this.bannerModel.deleteOne({
        bannerId: req.bannerId,
      });
      if (remove) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Deleted Successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'failed to delete',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
