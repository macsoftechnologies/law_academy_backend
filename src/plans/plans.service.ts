import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Plan } from './schema/plans.schema';
import { Model } from 'mongoose';
import { plansDto } from './dto/plans.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
  ) {}

  async addCoursePlan(req: plansDto) {
    try {
      const add = await this.planModel.create(req);
      if (add) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Plan added successfully',
          data: add,
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'failed to add',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getPlans(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [getList, totalCount] = await Promise.all([
        this.planModel.find().skip(skip).limit(limit),
        this.planModel.countDocuments(),
      ]);
    const userplans = await this.planModel.aggregate([
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
        {
          $addFields: {
            courseDetails: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$course_type', 'full-course'] },
                    then: { $arrayElemAt: ['$fullCourse', 0] },
                  },
                  {
                    case: { $eq: ['$course_type', 'subject-wise'] },
                    then: { $arrayElemAt: ['$subjectWise', 0] },
                  },
                  {
                    case: { $eq: ['$course_type', 'mains'] },
                    then: { $arrayElemAt: ['$mainsCourse', 0] },
                  },
                  {
                    case: { $eq: ['$course_type', 'notes'] },
                    then: { $arrayElemAt: ['$notesCourse', 0] },
                  },
                  {
                    case: { $eq: ['$course_type', 'prelimes'] },
                    then: { $arrayElemAt: ['$prelimesCourse', 0] },
                  },
                ],
                default: null,
              },
            },
          },
        },

        // Clean response
        {
          $project: {
            fullCourse: 0,
            subjectWise: 0,
            mainsCourse: 0,
            notesCourse: 0,
            prelimesCourse: 0,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]);
      return {
        statusCode: HttpStatus.OK,
        message: 'List of Plans',
        totalCount: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
        data: userplans,
      };
  }

  async getPlansByCourse(req: plansDto) {
    try {
      const getplans = await this.planModel.find({ course_id: req.course_id });
      if (getplans.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of plans for this course',
          data: getplans,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No plans found for this course',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getPlanById(req: plansDto) {
    try {
      const findPlan = await this.planModel.findOne({ planId: req.planId });
      if (findPlan) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Details of the plan',
          data: findPlan,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Plan Details not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async editPlan(req: plansDto) {
    try {
      const editplan = await this.planModel.updateOne(
        { planId: req.planId },
        {
          $set: {
            original_price: req.original_price,
            strike_price: req.strike_price,
            duration: req.duration,
            handling_fee: req.handling_fee,
            course_id: req.course_id,
            discount_percent: req.discount_percent,
            course_type: req.course_type,
          },
        },
      );
      if (editplan.modifiedCount > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Plan updated successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'failed to update',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async deletePlan(req: plansDto) {
    try {
      const removePlan = await this.planModel.deleteOne({ planId: req.planId });
      if (removePlan) {
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
