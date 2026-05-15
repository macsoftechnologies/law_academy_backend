import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Enrollment } from './schema/enrollment.schema';
import { Model } from 'mongoose';
import { enrollmentDto } from './dto/enrollment.dto';
import { Plan } from 'src/plans/schema/plans.schema';
import { BillingsService } from 'src/billing/billing.service';
import { Coupon } from 'src/coupons/schema/coupon.schema';
import { couponStatus } from 'src/auth/guards/roles.enum';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<Coupon>,
    @InjectModel(Plan.name) private readonly plansModel: Model<Plan>,
    private readonly billingsService: BillingsService,
  ) { }

  async addEnrollment(req: enrollmentDto) {
    try {
      const enrollDate = new Date();
      const enroll_date = enrollDate.toString();

      const findPlan = await this.plansModel.findOne({ planId: req.planId });
      if (!findPlan) {
        throw new Error('Plan not found');
      }

      const originalPrice = parseInt(findPlan['original_price']) ?? 0;

      let final_price = originalPrice;
      let appliedCouponCode: string = "";

      if (req.coupon_code) {
        const now = new Date();

        const coupon = await this.couponModel.findOne({
          coupon_code: req.coupon_code,
          status: couponStatus.ACTIVE,
          valid_from: { $lte: now },  
          valid_to: { $gte: now },   
        });

        if (!coupon) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid or expired coupon code',
          };
        }

        // Deduct offer_amount; floor at 0 so price never goes negative
        final_price = Math.max(0, originalPrice - coupon.offer_amount);
        appliedCouponCode = coupon.coupon_code;
      }

      const durationInYears = parseInt(findPlan.duration);
      const expiryDate = new Date(enrollDate);
      expiryDate.setFullYear(enrollDate.getFullYear() + durationInYears);
      const expiry_date = expiryDate.toString();
      const course_id = findPlan.course_id;

      const addEnroll = await this.enrollmentModel.create({
        ...req,
        enroll_date,
        expiry_date,
        course_id,
        coupon_code: appliedCouponCode,   
        final_price,                       
      });

      if (!addEnroll) {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to purchase',
        };
      }

      await this.billingsService.createBilling({
        userId: req.userId,
        enroll_id: addEnroll?.enroll_id,
        planId: req.planId,
        course_id,
        enroll_type: req.enroll_type,
        payment_id: req.payment_id,
        amount: final_price,          
        billing_cycle: findPlan.duration,
        valid_till: expiry_date,
        transaction_date: enroll_date,
        gst_percent: 18,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Purchased course successfully',
        data: {
          ...addEnroll.toObject(),
          original_price: originalPrice,   
          final_price,
          coupon_applied: !!appliedCouponCode,
        },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async userEnrollments(req: enrollmentDto) {
    try {
      const usercourses = await this.enrollmentModel.aggregate([
        { $match: { userId: req.userId } },

        // FULL COURSE
        {
          $lookup: {
            from: 'subcategories',
            localField: 'course_id',
            foreignField: 'subcategory_id',
            as: 'fullCourse',
          },
        },

        // SUBJECT WISE
        {
          $lookup: {
            from: 'subjects',
            localField: 'course_id',
            foreignField: 'subjectId',
            as: 'subjectWise',
          },
        },

        // MAINS
        {
          $lookup: {
            from: 'mains',
            localField: 'course_id',
            foreignField: 'mains_id',
            as: 'mainsCourse',
          },
        },

        // NOTES
        {
          $lookup: {
            from: 'notes',
            localField: 'course_id',
            foreignField: 'notes_id',
            as: 'notesCourse',
          },
        },

        // PRELIMS
        {
          $lookup: {
            from: 'prelimes',
            localField: 'course_id',
            foreignField: 'prelimes_id',
            as: 'prelimesCourse',
          },
        },

        // COMBINATIONS
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

      if (usercourses.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of User Courses',
          data: usercourses,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No courses found for this user',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async userEnrollmentDetails(req: enrollmentDto) {
    try {
      const findEnrollment = await this.enrollmentModel.aggregate([
        { $match: { enroll_id: req.enroll_id } },
        {
          $lookup: {
            from: 'plans',
            localField: 'planId',
            foreignField: 'planId',
            as: 'planId',
          },
        },
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

      if (findEnrollment.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Enrollment Details',
          data: findEnrollment,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Enrollment not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }
}
