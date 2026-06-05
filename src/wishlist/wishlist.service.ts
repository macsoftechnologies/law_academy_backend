import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WishlistItem } from './schema/wishlist-item.schema';
import { addWishlistItemDto, removeWishlistItemDto, listWishlistItemsDto } from './dto/wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(WishlistItem.name) private readonly wishlistItemModel: Model<WishlistItem>,
  ) {}

  async addToWishlist(dto: addWishlistItemDto) {
    try {
      const existing = await this.wishlistItemModel.findOne({
        userId: dto.userId,
        course_id: dto.course_id,
        enroll_type: dto.enroll_type,
      });

      if (existing) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Item is already in wishlist',
          data: existing,
        };
      }

      const newItem = await this.wishlistItemModel.create(dto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Item added to wishlist successfully',
        data: newItem,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  async removeFromWishlist(dto: removeWishlistItemDto) {
    try {
      const result = await this.wishlistItemModel.deleteOne({
        userId: dto.userId,
        wishlistItemId: dto.wishlistItemId,
      });

      if (result.deletedCount > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Item removed from wishlist successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Item not found in wishlist',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  async listWishlist(dto: listWishlistItemsDto) {
    try {
      const wishlistItems = await this.wishlistItemModel.aggregate([
        { $match: { userId: dto.userId } },
        {
          $lookup: {
            from: 'subcategories',
            localField: 'course_id',
            foreignField: 'subcategory_id',
            as: 'fullCourse',
          },
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'course_id',
            foreignField: 'subjectId',
            as: 'subjectWise',
          },
        },
        {
          $lookup: {
            from: 'mains',
            localField: 'course_id',
            foreignField: 'mains_id',
            as: 'mainsCourse',
          },
        },
        {
          $lookup: {
            from: 'notes',
            localField: 'course_id',
            foreignField: 'notes_id',
            as: 'notesCourse',
          },
        },
        {
          $lookup: {
            from: 'prelimes',
            localField: 'course_id',
            foreignField: 'prelimes_id',
            as: 'prelimesCourse',
          },
        },
        {
          $lookup: {
            from: 'combos',
            localField: 'course_id',
            foreignField: 'combo_id',
            as: 'combinationDetails',
          },
        },
        {
          $addFields: {
            courseDetails: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$enroll_type', 'full-course'] },
                    then: { $arrayElemAt: ['$fullCourse', 0] },
                  },
                  {
                    case: { $eq: ['$enroll_type', 'subject-wise'] },
                    then: { $arrayElemAt: ['$subjectWise', 0] },
                  },
                  {
                    case: { $eq: ['$enroll_type', 'mains'] },
                    then: { $arrayElemAt: ['$mainsCourse', 0] },
                  },
                  {
                    case: { $eq: ['$enroll_type', 'notes'] },
                    then: { $arrayElemAt: ['$notesCourse', 0] },
                  },
                  {
                    case: { $eq: ['$enroll_type', 'prelimes'] },
                    then: { $arrayElemAt: ['$prelimesCourse', 0] },
                  },
                  {
                    case: { $eq: ['$enroll_type', 'combination'] },
                    then: { $arrayElemAt: ['$combinationDetails', 0] },
                  },
                ],
                default: null,
              },
            },
          },
        },
        {
          $project: {
            fullCourse: 0,
            subjectWise: 0,
            mainsCourse: 0,
            notesCourse: 0,
            prelimesCourse: 0,
            combinationDetails: 0,
          },
        },
      ]);

      return {
        statusCode: HttpStatus.OK,
        message: 'Wishlist items listed successfully',
        data: wishlistItems,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }
}
