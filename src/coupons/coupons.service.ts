import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon } from './schema/coupon.schema';
import { Model } from 'mongoose';
import { couponDto } from './dto/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
  ) {}

  async createCoupon(req: couponDto) {
    try {
      const add = await this.couponModel.create(req);
      if (add) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Coupon added successfully',
          data: add,
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'failed to add coupon',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getCouponsList(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const [getList, totalCount] = await Promise.all([
        this.couponModel.find().skip(skip).limit(limit),
        this.couponModel.countDocuments(),
      ]);
      return {
        statusCode: HttpStatus.OK,
        message: 'List of Coupons',
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

  async getCouponById(req: couponDto) {
    try {
      const getdetails = await this.couponModel.findOne({
        couponId: req.couponId,
      });
      if (getdetails) {
        return {
          statuscode: HttpStatus.OK,
          message: 'Details of coupon',
          data: getdetails,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Coupon details not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async updateCoupon(req: couponDto) {
    try {
      const updatecoupon = await this.couponModel.updateOne(
        { couponId: req.couponId },
        {
          $set: {
            coupon_code: req.coupon_code,
            offer_amount: req.offer_amount,
            status: req.status,
            valid_from: req.valid_from,
            valid_to: req.valid_to,
          },
        },
      );
      if (updatecoupon.modifiedCount > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Coupon updated successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to update',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async deleteCoupon(req: couponDto) {
    try{
      const removecoupon = await this.couponModel.deleteOne({couponId: req.couponId});
      if(removecoupon) {
        return {
          statusCode: HttpStatus.OK,
          message: "Coupon deleted successfully",
        }
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: "Failed to delete coupon",
        }
      }
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}
