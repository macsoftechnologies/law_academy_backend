import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Prelimes } from './schema/prelimes.schema';
import { Model } from 'mongoose';
import { prelimesDto } from './dto/prelimes.dto';
import { Enrollment } from 'src/enrollments/schema/enrollment.schema';
import { MockTestSubject } from './schema/subject-wise-mock-test.schema';
import { mockTestSubjectDto } from './dto/subject-wise-mock-test.dto';
import { duration } from 'moment';

@Injectable()
export class PrelimesService {
  constructor(
    @InjectModel(Prelimes.name) private readonly prelimesModel: Model<Prelimes>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
    @InjectModel(MockTestSubject.name)
    private readonly mockTestSubjectModel: Model<MockTestSubject>,
  ) {}

  async addPrelimes(req: prelimesDto, image) {
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

        req.presentation_image = reqDoc.toString();
      }
      const course_points = Array.isArray(req.course_points)
        ? req.course_points
        : JSON.parse(req.course_points);
      const add = await this.prelimesModel.create({
        ...req,
        course_points,
      });
      if (add) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Prelimes added successfully',
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
        message: error.message,
      };
    }
  }

  async getPrelimesList(page: number, limit: number, userId: string) {
    try {
      const skip = (page - 1) * limit;
      const today = new Date();
      const fullCourseEnrollment = await this.enrollmentModel.findOne({
        userId,
        enroll_type: 'full-course',
        status: 'active',
      });

      const data = await this.prelimesModel.aggregate([
        { $skip: skip },
        { $limit: limit },

        {
          $lookup: {
            from: 'enrollments',
            let: { prelimesId: '$prelimes_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', userId] },
                      { $eq: ['$status', 'active'] },
                      { $eq: ['$enroll_type', 'prelimes'] },
                      { $eq: ['$course_id', '$$prelimesId'] },
                    ],
                  },
                },
              },
            ],
            as: 'prelimesEnrollment',
          },
        },

        {
          $addFields: {
            prelimesEnrollment: { $arrayElemAt: ['$prelimesEnrollment', 0] },
          },
        },

        {
          $addFields: {
            finalEnrollment: fullCourseEnrollment
              ? fullCourseEnrollment
              : '$prelimesEnrollment',

            isEnrolled: fullCourseEnrollment
              ? true
              : {
                  $cond: [
                    { $ifNull: ['$prelimesEnrollment', false] },
                    true,
                    false,
                  ],
                },
          },
        },

        {
          $addFields: {
            expiryDateClean: {
              $cond: [
                { $ifNull: ['$finalEnrollment.expiry_date', false] },
                {
                  $replaceAll: {
                    input: '$finalEnrollment.expiry_date',
                    find: ' (India Standard Time)',
                    replacement: '',
                  },
                },
                null,
              ],
            },
          },
        },

        {
          $addFields: {
            expiryDateObj: {
              $cond: [
                { $ifNull: ['$expiryDateClean', false] },
                {
                  $dateFromString: {
                    dateString: '$expiryDateClean',
                    onError: null,
                  },
                },
                null,
              ],
            },
          },
        },

        {
          $addFields: {
            remaining_duration: {
              $cond: [
                {
                  $and: [
                    { $ifNull: ['$expiryDateObj', false] },
                    { $gt: ['$expiryDateObj', today] },
                  ],
                },
                {
                  $ceil: {
                    $divide: [
                      { $subtract: ['$expiryDateObj', today] },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                },
                null,
              ],
            },
          },
        },

        {
          $lookup: {
            from: 'plans',
            localField: 'prelimes_id',
            foreignField: 'course_id',
            as: 'plans',
          },
        },

        {
          $addFields: {
            availablePlans: {
              $cond: [{ $eq: ['$isEnrolled', false] }, '$plans', []],
            },
          },
        },

        {
          $project: {
            title: 1,
            sub_title: 1,
            presentation_image: 1,
            prelimes_id: 1,
            subcategory_id: 1,

            isEnrolled: 1,
            enroll_date: '$finalEnrollment.enroll_date',
            expiry_date: '$expiryDateObj',
            remaining_duration: 1,

            availablePlans: 1,
          },
        },
      ]);

      const totalCount = await this.prelimesModel.countDocuments();

      return {
        statusCode: HttpStatus.OK,
        message: 'List of Prelimes',
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  async getPrelimesById(req: prelimesDto) {
    try {
      // const getlecture = await this.prelimesModel.findOne({
      //   prelimes_id: req.prelimes_id,
      // });
      const getlecture = await this.prelimesModel.aggregate([
        { $match: { prelimes_id: req.prelimes_id } },
        {
          $lookup: {
            from: 'subcategories',
            localField: 'subcategory_id',
            foreignField: 'subcategory_id',
            as: 'subcategory_id',
          },
        },
      ]);
      if (getlecture) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Prelimes Details',
          data: getlecture,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Prelimes not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async editPrelimes(req: prelimesDto, image) {
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

        req.presentation_image = reqDoc.toString();
      }
      const course_points = Array.isArray(req.course_points)
        ? req.course_points
        : JSON.parse(req.course_points);
      if (req.presentation_image) {
        const updateLecture = await this.prelimesModel.updateOne(
          { prelimes_id: req.prelimes_id },
          {
            $set: {
              title: req.title,
              sub_title: req.sub_title,
              presentation_image: req.presentation_image,
              about_course: req.about_course,
              course_points: course_points,
              terms_conditions: req.terms_conditions,
              subcategory_id: req.subcategory_id,
            },
          },
        );
        if (updateLecture.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Prelimes Updated Successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Failed to update.',
          };
        }
      } else {
        const updateLecture = await this.prelimesModel.updateOne(
          { prelimes_id: req.prelimes_id },
          {
            $set: {
              title: req.title,
              sub_title: req.sub_title,
              about_course: req.about_course,
              course_points: course_points,
              terms_conditions: req.terms_conditions,
              subcategory_id: req.subcategory_id,
            },
          },
        );
        if (updateLecture.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Prelimes Updated Successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Failed to update.',
          };
        }
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async deletePrelimes(req: prelimesDto) {
    try {
      const remove = await this.prelimesModel.deleteOne({
        prelimes_id: req.prelimes_id,
      });
      if (remove) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Prelimes has been removed successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to delete Prelimes.',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // mock test subjects apis from here

  async addMockTestSubject(req: mockTestSubjectDto, image) {
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

        req.presentation_image = reqDoc.toString();
      }
      const addSubject = await this.mockTestSubjectModel.create(req);
      if (addSubject) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Mock Test Subject Added successfully',
          data: addSubject,
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
        message: error.message,
      };
    }
  }

  async getMockTestSubjects(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const getsubjects = await this.mockTestSubjectModel.aggregate([
        {
          $lookup: {
            from: 'laws',
            localField: 'lawId',
            foreignField: 'lawId',
            as: 'lawDetails',
          },
        },
        {
          $unwind: {
            path: '$lawDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'prelimes',
            localField: 'prelimes_id',
            foreignField: 'prelimes_id',
            as: 'prelimesDetails',
          },
        },
        {
          $unwind: {
            path: '$prelimesDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            lawSubcategoryId: '$lawDetails.subcategory_id',
          },
        },
        {
          $lookup: {
            from: 'subcategories',
            localField: 'lawSubcategoryId',
            foreignField: 'subcategory_id',
            as: 'CourseDetails',
          },
        },
        {
          $unwind: {
            path: '$CourseDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            mocktest_subject_id: 1,
            presentation_image: 1,
            title: 1,
            no_of_qos: 1,
            duration: 1,
            prelimes: {
              prelimes_id: '$prelimesDetails.prelimes_id',
              title: '$prelimesDetails.title',
            },
            law: {
              lawId: '$lawDetails.lawId',
              title: '$lawDetails.title',
            },
            course: {
              subcategory_id: '$CourseDetails.subcategory_id',
              title: '$CourseDetails.title',
            },
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]);
      console.log('subjectmocktestsList....', getsubjects);
      const totalCount = await this.mockTestSubjectModel.countDocuments();
      if (getsubjects.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of Mock Test Subjects',
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          limit,
          data: getsubjects,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Mock Test Subjects Not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getMockTestDetails(req: mockTestSubjectDto) {
    try {
      const details = await this.mockTestSubjectModel.aggregate([
        { $match: { mocktest_subject_id: req.mocktest_subject_id } },
        {
          $lookup: {
            from: 'laws',
            localField: 'lawId',
            foreignField: 'lawId',
            as: 'lawDetails',
          },
        },
        {
          $unwind: {
            path: '$lawDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'prelimes',
            localField: 'prelimes_id',
            foreignField: 'prelimes_id',
            as: 'prelimesDetails',
          },
        },
        {
          $unwind: {
            path: '$prelimesDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            lawSubcategoryId: '$lawDetails.subcategory_id',
          },
        },
        {
          $lookup: {
            from: 'subcategories',
            localField: 'lawSubcategoryId',
            foreignField: 'subcategory_id',
            as: 'CourseDetails',
          },
        },
        {
          $unwind: {
            path: '$CourseDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            mocktest_subject_id: 1,
            presentation_image: 1,
            title: 1,
            no_of_qos: 1,
            duration: 1,
            prelimes: {
              prelimes_id: '$prelimesDetails.prelimes_id',
              title: '$prelimesDetails.title',
            },
            law: {
              lawId: '$lawDetails.lawId',
              title: '$lawDetails.title',
            },
            course: {
              subcategory_id: '$CourseDetails.subcategory_id',
              title: '$CourseDetails.title',
            },
          },
        },
      ]);
      if (details.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Details of Mock Test Subject',
          data: details,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Mock Test Details not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getMockTestBasedOnLaw(req: mockTestSubjectDto) {
    try {
      const getLawMockTests = await this.mockTestSubjectModel.find({
        lawId: req.lawId,
      });
      if (getLawMockTests.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of Subject Wise Mock Test By Law',
          data: getLawMockTests,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No Subject Wise Mock Tests Found.',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async editMockTest(req: mockTestSubjectDto, image) {
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

        req.presentation_image = reqDoc.toString();
      }
      if (req.presentation_image) {
        const updateLecture = await this.mockTestSubjectModel.updateOne(
          { mocktest_subject_id: req.mocktest_subject_id },
          {
            $set: {
              presentation_image: req.presentation_image,
              title: req.title,
              no_of_qos: req.no_of_qos,
              duration: req.duration,
              lawId: req.lawId,
              prelimes_id: req.prelimes_id,
            },
          },
        );
        if (updateLecture.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Subject Mock Test Updated Successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Failed to update.',
          };
        }
      } else {
        const updateLecture = await this.mockTestSubjectModel.updateOne(
          { mocktest_subject_id: req.mocktest_subject_id },
          {
            $set: {
              title: req.title,
              no_of_qos: req.no_of_qos,
              duration: req.duration,
              lawId: req.lawId,
              prelimes_id: req.prelimes_id,
            },
          },
        );
        if (updateLecture.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Subject Mock Test Updated Successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Failed to update.',
          };
        }
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async deleteSubjectMockTest(req: mockTestSubjectDto) {
    try {
      const remove = await this.mockTestSubjectModel.deleteOne({
        mocktest_subject_id: req.mocktest_subject_id,
      });
      if (remove) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Subject Mock Test has been removed successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to delete Subject Mock Test.',
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
