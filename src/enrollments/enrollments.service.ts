import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Enrollment } from './schema/enrollment.schema';
import { Model } from 'mongoose';
import { enrollmentDto } from './dto/enrollment.dto';
import { Plan } from 'src/plans/schema/plans.schema';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
    @InjectModel(Plan.name) private readonly plansModel: Model<Plan>,
  ) {}

  async addEnrollment(req: enrollmentDto) {
    try {
      const enrollDate = new Date();
      const enroll_date = enrollDate.toString();
      const findPlan = await this.plansModel.findOne({ planId: req.planId });
      if (!findPlan) {
        throw new Error('Plan not found');
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
      });
      if (addEnroll) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Purchased course successfully',
          data: addEnroll,
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'failed to purchase',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async userEnrollments(req: enrollmentDto) {
    try {
      const usercourses = await this.enrollmentModel.aggregate([
        {
          $match: { userId: req.userId },
        },

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

        // Pick correct course based on enroll_type
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
        message: error,
      };
    }
  }
}
