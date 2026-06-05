import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartItem } from './schema/cart-item.schema';
import { Plan } from 'src/plans/schema/plans.schema';
import { addCartItemDto, removeCartItemDto, listCartItemsDto, moveFromWishlistDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(CartItem.name) private readonly cartItemModel: Model<CartItem>,
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
    @InjectModel('WishlistItem') private readonly wishlistItemModel: Model<any>,
  ) {}

  async addToCart(dto: addCartItemDto) {
    try {
      const existing = await this.cartItemModel.findOne({
        userId: dto.userId,
        course_id: dto.course_id,
        enroll_type: dto.enroll_type,
      });

      if (existing) {
        existing.planId = dto.planId;
        await existing.save();
        return {
          statusCode: HttpStatus.OK,
          message: 'Cart item updated with new plan',
          data: existing,
        };
      }

      const newItem = await this.cartItemModel.create(dto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Item added to cart successfully',
        data: newItem,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  async removeFromCart(dto: removeCartItemDto) {
    try {
      const result = await this.cartItemModel.deleteOne({
        userId: dto.userId,
        cartItemId: dto.cartItemId,
      });

      if (result.deletedCount > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Item removed from cart successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Item not found in cart',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  async listCart(dto: listCartItemsDto) {
    try {
      const cartItems = await this.cartItemModel.aggregate([
        { $match: { userId: dto.userId } },
        {
          $lookup: {
            from: 'plans',
            localField: 'planId',
            foreignField: 'planId',
            as: 'plan',
          },
        },
        { $addFields: { plan: { $arrayElemAt: ['$plan', 0] } } },
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
        message: 'Cart items listed successfully',
        data: cartItems,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  async moveFromWishlist(dto: moveFromWishlistDto) {
    try {
      const wishlistItem = await this.wishlistItemModel.findOne({
        userId: dto.userId,
        wishlistItemId: dto.wishlistItemId,
      });

      if (!wishlistItem) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Wishlist item not found',
        };
      }

      const cartResult = await this.addToCart({
        userId: dto.userId,
        course_id: wishlistItem.course_id,
        enroll_type: wishlistItem.enroll_type,
        planId: dto.planId,
      });

      if (cartResult.statusCode === HttpStatus.OK) {
        await this.wishlistItemModel.deleteOne({ wishlistItemId: dto.wishlistItemId });
        return {
          statusCode: HttpStatus.OK,
          message: 'Item moved from wishlist to cart successfully',
          data: cartResult.data,
        };
      }

      return cartResult;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }
}
