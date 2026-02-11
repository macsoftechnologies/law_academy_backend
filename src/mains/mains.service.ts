import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Mains } from './schema/mains.schema';
import { Model } from 'mongoose';
import { mainsDto } from './dto/mains.dto';
import { Enrollment } from 'src/enrollments/schema/enrollment.schema';
import { MainsTest } from './schema/mains-test.schema';
import { MainsSubjectTest } from './schema/mains-subject-test.schema';
import { MainsAttempts } from './schema/mains_attempts.schema';
import { MainsResults } from './schema/mains-test-results.schema';
import { mainsTestDto } from './dto/mains-test.dto';
import { mainsSubjectTestDto } from './dto/mains-subject-test.dto';
import { mainsAttemptDto } from './dto/mains_attempts.dto';
import { BunnyService } from 'src/auth/bunny.service';
import { mainsTestResultsDto } from './dto/mains-test-results.dto';
import { mainsAttemptStatus } from 'src/auth/guards/roles.enum';

@Injectable()
export class MainsService {
  constructor(
    @InjectModel(Mains.name) private readonly MainsModel: Model<Mains>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
    @InjectModel(MainsTest.name)
    private readonly mainsTestModel: Model<MainsTest>,
    @InjectModel(MainsSubjectTest.name)
    private readonly mainsSubjectModel: Model<MainsSubjectTest>,
    @InjectModel(MainsAttempts.name)
    private readonly mainsAttemptModel: Model<MainsAttempts>,
    @InjectModel(MainsResults.name)
    private readonly MainsResultModel: Model<MainsResults>,
    private readonly bunnyService: BunnyService,
  ) {}

  async addMains(req: mainsDto, image) {
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
      const add = await this.MainsModel.create({
        ...req,
        course_points,
      });
      if (add) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Mains added successfully',
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

  async getMainsList(page: number, limit: number, userId: string) {
    try {
      const skip = (page - 1) * limit;
      const today = new Date();
      const fullCourseEnrollment = await this.enrollmentModel.findOne({
        userId,
        enroll_type: 'full-course',
        status: 'active',
      });

      const data = await this.MainsModel.aggregate([
        { $skip: skip },
        { $limit: limit },

        {
          $lookup: {
            from: 'enrollments',
            let: { mainsId: '$mains_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', userId] },
                      { $eq: ['$status', 'active'] },
                      { $eq: ['$enroll_type', 'mains'] },
                      { $eq: ['$course_id', '$$mainsId'] },
                    ],
                  },
                },
              },
            ],
            as: 'mainsEnrollment',
          },
        },

        {
          $addFields: {
            mainsEnrollment: { $arrayElemAt: ['$mainsEnrollment', 0] },
          },
        },

        {
          $addFields: {
            finalEnrollment: fullCourseEnrollment
              ? fullCourseEnrollment
              : '$mainsEnrollment',

            isEnrolled: fullCourseEnrollment
              ? true
              : {
                  $cond: [
                    { $ifNull: ['$mainsEnrollment', false] },
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
            localField: 'mains_id',
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
            mains_id: 1,
            subcategory_id: 1,

            isEnrolled: 1,
            enroll_date: '$finalEnrollment.enroll_date',
            expiry_date: '$expiryDateObj',
            remaining_duration: 1,

            availablePlans: 1,
          },
        },
      ]);

      const totalCount = await this.MainsModel.countDocuments();

      return {
        statusCode: HttpStatus.OK,
        message: 'List of Mains',
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

  async getMainsById(req: mainsDto) {
    try {
      // const getlecture = await this.MainsModel.findOne({
      //   mains_id: req.mains_id,
      // });
      const getlecture = await this.MainsModel.aggregate([
        { $match: { mains_id: req.mains_id } },
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
          message: 'Mains Details',
          data: getlecture,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Mains not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async editMains(req: mainsDto, image) {
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
        const updateLecture = await this.MainsModel.updateOne(
          { mains_id: req.mains_id },
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
            message: 'Mains Updated Successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Failed to update.',
          };
        }
      } else {
        const updateLecture = await this.MainsModel.updateOne(
          { mains_id: req.mains_id },
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
            message: 'Mains Updated Successfully',
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

  async deleteMains(req: mainsDto) {
    try {
      const remove = await this.MainsModel.deleteOne({
        mains_id: req.mains_id,
      });
      if (remove) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Mains has been removed successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to delete Mains.',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // Mains Test Apis from here

  async addMainsTest(req: mainsTestDto, image) {
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
      const addtest = await this.mainsTestModel.create(req);
      if (addtest) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Test Added successfully',
          data: addtest,
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'failed to add',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.OK,
        message: error.message,
      };
    }
  }

  async getMainsTestsList(page?: number, limit?: number, mains_id?: string) {
    try {
      const pageNum = page && page > 0 ? page : 1;
      const limitNum = limit && limit > 0 ? limit : 10;
      const skip = (pageNum - 1) * limitNum;

      const pipeline: any[] = [];
      if (mains_id) {
        pipeline.push({
          $match: { mains_id },
        });
      }

      pipeline.push(
        {
          $lookup: {
            from: 'mains',
            localField: 'mains_id',
            foreignField: 'mains_id',
            as: 'mains',
          },
        },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limitNum }],
            totalCount: [{ $count: 'count' }],
          },
        },
      );

      const result = await this.mainsTestModel.aggregate(pipeline);

      const data = result[0]?.data || [];
      const totalCount = result[0]?.totalCount[0]?.count || 0;

      return {
        statusCode: HttpStatus.OK,
        message: 'List of Tests',
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        limit: limitNum,
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getMainsTestById(req: mainsTestDto) {
    try {
      const testDetails = await this.mainsTestModel.aggregate([
        { $match: { mains_test_id: req.mains_test_id } },
        {
          $lookup: {
            from: 'mains',
            localField: 'mains_id',
            foreignField: 'mains_id',
            as: 'mains_id',
          },
        },
      ]);
      if (testDetails) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Details of Mains Test',
          data: testDetails,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Test not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async editMainsTest(req: mainsTestDto, image) {
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
        const edittest = await this.mainsTestModel.updateOne(
          { mains_test_id: req.mains_test_id },
          {
            $set: {
              title: req.title,
              no_of_qs: req.no_of_qs,
              no_of_subjects: req.no_of_subjects,
              presentation_image: req.presentation_image,
              terms_conditions: req.terms_conditions,
            },
          },
        );
        if (edittest.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Updated successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'failed to update',
          };
        }
      } else {
        const edittest = await this.mainsTestModel.updateOne(
          { mains_test_id: req.mains_test_id },
          {
            $set: {
              title: req.title,
              no_of_qs: req.no_of_qs,
              no_of_subjects: req.no_of_subjects,
              terms_conditions: req.terms_conditions,
            },
          },
        );
        if (edittest.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Updated successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'failed to update',
          };
        }
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async deleteMainsTest(req: mainsTestDto) {
    try {
      const remove = await this.mainsTestModel.deleteOne({
        mains_test_id: req.mains_test_id,
      });
      if (remove) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Mains Test has been removed successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to delete.',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // Mains Subject Test Apis from here
  async addMainsSubjectTest(req: mainsSubjectTestDto) {
    try {
      const addtest = await this.mainsSubjectModel.create(req);
      if (addtest) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Subject Test Added successfully',
          data: addtest,
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

  async getMainsSubjectTestsList(
    page: number,
    limit: number,
    mains_test_id: string,
  ) {
    try {
      const pageNum = page && page > 0 ? page : 1;
      const limitNum = limit && limit > 0 ? limit : 10;
      const skip = (pageNum - 1) * limitNum;

      const pipeline: any[] = [];
      if (mains_test_id) {
        pipeline.push({
          $match: { mains_test_id },
        });
      }

      pipeline.push(
        {
          $lookup: {
            from: 'mainstests',
            localField: 'mains_test_id',
            foreignField: 'mains_test_id',
            as: 'mains_test_id',
          },
        },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limitNum }],
            totalCount: [{ $count: 'count' }],
          },
        },
      );

      const result = await this.mainsSubjectModel.aggregate(pipeline);

      const data = result[0]?.data || [];
      const totalCount = result[0]?.totalCount[0]?.count || 0;

      return {
        statusCode: HttpStatus.OK,
        message: 'List of Mains Subject Tests',
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        limit: limitNum,
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getMainsSubjectById(req: mainsSubjectTestDto) {
    try {
      const testDetails = await this.mainsSubjectModel.aggregate([
        { $match: { mains_subject_test_id: req.mains_subject_test_id } },
        {
          $lookup: {
            from: 'mainstests',
            localField: 'mains_test_id',
            foreignField: 'mains_test_id',
            as: 'mains_test_id',
          },
        },
      ]);
      if (testDetails) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Details of Mains Subject Test',
          data: testDetails,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Test not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async editMainsSubjectTest(req: mainsSubjectTestDto) {
    try {
      const edittest = await this.mainsSubjectModel.updateOne(
        { mains_subject_test_id: req.mains_subject_test_id },
        {
          $set: {
            title: req.title,
            no_of_qos: req.no_of_qos,
            duration: req.duration,
            question_paper_file: req.question_paper_file,
            marks: req.marks,
          },
        },
      );
      if (edittest.modifiedCount > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Updated successfully',
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
        message: error.message,
      };
    }
  }

  async deleteMainsSubjectTest(req: mainsSubjectTestDto) {
    try {
      const remove = await this.mainsSubjectModel.deleteOne({
        mains_subject_test_id: req.mains_subject_test_id,
      });
      if (remove) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Mains Subject Test has been removed successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to delete.',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // student attemps for mains test series

  async addAttempt(req: mainsAttemptDto, file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('Answer script is required');
      }

      if (!file.mimetype.includes('pdf')) {
        throw new BadRequestException('Only PDF allowed');
      }

      const uniqueFileName = `attempt-${Date.now()}-${file.originalname}`;

      const fileUrl = await this.bunnyService.uploadSingleFile(
        file.buffer,
        uniqueFileName,
      );

      const attemptCount = await this.mainsAttemptModel.countDocuments({
        mains_subject_test_id: req.mains_subject_test_id,
        userId: req.userId,
      });

      const attemptNo = attemptCount + 1;
      const now = new Date();

      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString();

      const attempt = await this.mainsAttemptModel.create({
        ...req,
        date: date,
        time: time,
        attempt_no: attemptNo,
        answer_script_file: fileUrl,
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Attempt recorded successfully',
        data: attempt,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getAttempts(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const getlist = await this.mainsAttemptModel.aggregate([
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "mainsresults",
            localField: "mains_attempt_id",
            foreignField: "mains_attempt_id",
            as: "result",
          }
        },
        { $unwind: '$result' },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'userId',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $lookup: {
            from: 'mainssubjecttests',
            localField: 'mains_subject_test_id',
            foreignField: 'mains_subject_test_id',
            as: 'subject',
          },
        },
        { $unwind: '$subject' },
        {
          $lookup: {
            from: 'mainstests',
            localField: 'subject.mains_test_id',
            foreignField: 'mains_test_id',
            as: 'mainsTest',
          },
        },
        { $unwind: '$mainsTest' },
        {
          $project: {
            mains_attempt_id: 1,
            date: 1,
            time: 1,
            answer_script_file: 1,
            status: 1,
            attempt_no: 1,
            createdAt: 1,

            user: {
              userId: '$user.userId',
              name: '$user.name',
              email: '$user.email',
              mobile_number: '$user.mobile_number',
            },

            subject: {
              mains_subject_test_id: '$subject.mains_subject_test_id',
              title: '$subject.title',
              no_of_qos: '$subject.no_of_qos',
              duration: '$subject.duration',
              marks: '$subject.marks',
            },

            mainsTest: {
              mains_test_id: '$mainsTest.mains_test_id',
              title: '$mainsTest.title',
              no_of_qs: '$mainsTest.no_of_qs',
              no_of_subjects: '$mainsTest.no_of_subjects',
              presentation_image: '$mainsTest.presentation_image',
            },

            result: '$result'
          },
        },
      ]);

      const totalCount = await this.mainsAttemptModel.countDocuments();

      if (getlist.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of Attempts',
          currentPage: page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          data: getlist,
        };
      }

      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'No Attempts found',
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  // async getMainsTestWithAttempts(mainsTestId: string, userId: string) {
  //   console.log('console for body...', mainsTestId, userId);
  //   const data = await this.mainsAttemptModel.aggregate([
  //     {
  //       $match: { userId },
  //     },

  //     {
  //       $lookup: {
  //         from: 'mainssubjecttests',
  //         localField: 'mains_subject_test_id',
  //         foreignField: 'mains_subject_test_id',
  //         as: 'subject',
  //       },
  //     },
  //     { $unwind: '$subject' },

  //     {
  //       $lookup: {
  //         from: 'mainstests',
  //         localField: 'subject.mains_test_id',
  //         foreignField: 'mains_test_id',
  //         as: 'mainsTest',
  //       },
  //     },
  //     { $unwind: '$mainsTest' },

  //     {
  //       $match: {
  //         'mainsTest.mains_test_id': mainsTestId,
  //       },
  //     },

  //     {
  //       $group: {
  //         _id: '$attempt_no',
  //         attempt_no: { $first: '$attempt_no' },
  //         subjects: {
  //           $push: {
  //             mains_subject_test_id: '$mains_subject_test_id',
  //             title: '$subject.title',
  //             no_of_qos: '$subject.no_of_qos',
  //             duration: '$subject.duration',
  //             status: '$status',
  //           },
  //         },
  //         mainsTest: { $first: '$mainsTest' },
  //       },
  //     },

  //     {
  //       $sort: { attempt_no: 1 },
  //     },

  //     {
  //       $group: {
  //         _id: '$mainsTest.mains_test_id',
  //         mains_test_id: { $first: '$mainsTest.mains_test_id' },
  //         title: { $first: '$mainsTest.title' },
  //         no_of_qs: { $first: '$mainsTest.no_of_qs' },
  //         no_of_subjects: { $first: '$mainsTest.no_of_subjects' },
  //         presentation_image: { $first: '$mainsTest.presentation_image' },
  //         attempts: {
  //           $push: {
  //             attempt_no: '$attempt_no',
  //             subjects: '$subjects',
  //           },
  //         },
  //       },
  //     },
  //   ]);

  //   return data[0] || null;
  // }

  async getMainsTestWithAttempts(mainsTestId: string, userId: string) {
    const data = await this.mainsAttemptModel.aggregate([
      {
        $match: { userId },
      },

      {
        $lookup: {
          from: 'mainssubjecttests',
          localField: 'mains_subject_test_id',
          foreignField: 'mains_subject_test_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },

      {
        $lookup: {
          from: 'mainstests',
          localField: 'subject.mains_test_id',
          foreignField: 'mains_test_id',
          as: 'mainsTest',
        },
      },
      { $unwind: '$mainsTest' },

      {
        $match: {
          'mainsTest.mains_test_id': mainsTestId,
        },
      },

      // 🔥 RESULT LOOKUP
      {
        $lookup: {
          from: 'mainsresults',
          localField: 'mains_attempt_id',
          foreignField: 'mains_attempt_id',
          as: 'result',
        },
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $group: {
          _id: '$attempt_no',
          attempt_no: { $first: '$attempt_no' },

          subjects: {
            $push: {
              mains_subject_test_id: '$mains_subject_test_id',
              title: '$subject.title',
              no_of_qos: '$subject.no_of_qos',
              duration: '$subject.duration',
              status: '$status',
              result: '$result'
            },
          },

          mainsTest: { $first: '$mainsTest' },
        },
      },

      { $sort: { attempt_no: 1 } },

      {
        $group: {
          _id: '$mainsTest.mains_test_id',
          mains_test_id: { $first: '$mainsTest.mains_test_id' },
          title: { $first: '$mainsTest.title' },
          no_of_qs: { $first: '$mainsTest.no_of_qs' },
          no_of_subjects: { $first: '$mainsTest.no_of_subjects' },
          presentation_image: { $first: '$mainsTest.presentation_image' },

          attempts: {
            $push: {
              attempt_no: '$attempt_no',
              subjects: '$subjects',
            },
          },
        },
      },
    ]);
    if(data[0]) {
      return {
        statusCode: HttpStatus.OK,
        message: "Mains Subject Tests With their attempts.",
        data: data[0]
      }
    } else {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "Mains Subject Tests not found"
      }
    }
  }

  async getAttemptDetails(req: mainsAttemptDto) {
    try {
      const getDetails = await this.mainsAttemptModel.aggregate([
        { $match: { mains_attempt_id: req.mains_attempt_id } },
        {
          $lookup: {
            from: "mainsresults",
            localField: "mains_attempt_id",
            foreignField: "mains_attempt_id",
            as: "result",
          }
        },
        { $unwind: '$result' },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'userId',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $lookup: {
            from: 'mainssubjecttests',
            localField: 'mains_subject_test_id',
            foreignField: 'mains_subject_test_id',
            as: 'subject',
          },
        },
        { $unwind: '$subject' },
        {
          $lookup: {
            from: 'mainstests',
            localField: 'subject.mains_test_id',
            foreignField: 'mains_test_id',
            as: 'mainsTest',
          },
        },
        { $unwind: '$mainsTest' },
        {
          $project: {
            mains_attempt_id: 1,
            date: 1,
            time: 1,
            answer_script_file: 1,
            status: 1,
            attempt_no: 1,
            createdAt: 1,

            user: {
              userId: '$user.userId',
              name: '$user.name',
              email: '$user.email',
              mobile_number: '$user.mobile_number',
            },

            subject: {
              mains_subject_test_id: '$subject.mains_subject_test_id',
              title: '$subject.title',
              no_of_qos: '$subject.no_of_qos',
              duration: '$subject.duration',
              marks: '$subject.marks',
            },

            mainsTest: {
              mains_test_id: '$mainsTest.mains_test_id',
              title: '$mainsTest.title',
              no_of_qs: '$mainsTest.no_of_qs',
              no_of_subjects: '$mainsTest.no_of_subjects',
              presentation_image: '$mainsTest.presentation_image',
            },

            result: '$result'
          },
        },
      ]);
      if (getDetails) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Details of attempt',
          data: getDetails,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Attempt not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  // results of the attempt
  async addResult(req: mainsTestResultsDto) {
    try {
      const findAttempt = await this.mainsAttemptModel.findOne({
        mains_attempt_id: req.mains_attempt_id,
      });
      const findSubjectTest = await this.mainsSubjectModel.findOne({
        mains_subject_test_id: findAttempt?.mains_subject_test_id,
      });
      let percentage;
      let submissionDate;
      if (findAttempt && findSubjectTest) {
        percentage = (req.marks_scored / findSubjectTest.marks) * 100;
        submissionDate = findAttempt.date;
      } else {
        percentage = 0;
        submissionDate = '';
      }
      const now = new Date();
      const date_of_evaluation = now.toLocaleDateString();
      const add = await this.MainsResultModel.create({
        ...req,
        overall_percentage: percentage,
        date_of_submission: submissionDate,
        date_of_evaluation: date_of_evaluation,
      });
      if (add) {
        const editAttemptStatus = await this.mainsAttemptModel.updateOne(
          { mains_attempt_id: req.mains_attempt_id },
          {
            $set: {
              status: mainsAttemptStatus.RESULT,
            },
          },
        );
        if (editAttemptStatus.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Result added to the attempt',
            data: add,
          };
        } else {
          await this.MainsResultModel.deleteOne({
            mains_result_id: add.mains_result_id,
          });
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'failed to add result',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'failed to add result',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getResultDetails(req: mainsTestResultsDto) {
    try {
      const getDetails = await this.MainsResultModel.aggregate([
        { $match: { mains_result_id: req.mains_result_id } },
        {
          $lookup: {
            from: 'mainsattempts',
            localField: 'mains_attempt_id',
            foreignField: 'mains_attempt_id',
            as: 'attempt',
          },
        },
        { $unwind: '$attempt' },
        {
          $lookup: {
            from: 'users',
            localField: 'attempt.userId',
            foreignField: 'userId',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $lookup: {
            from: 'mainssubjecttests',
            localField: 'attempt.mains_subject_test_id',
            foreignField: 'mains_subject_test_id',
            as: 'subject',
          },
        },
        { $unwind: '$subject' },
        {
          $lookup: {
            from: 'mainstests',
            localField: 'subject.mains_test_id',
            foreignField: 'mains_test_id',
            as: 'mainsTest',
          },
        },
        { $unwind: '$mainsTest' },
        {
          $project: {
            mains_result_id: 1,
            date_of_submission: 1,
            date_of_evaluation: 1,
            marks_scored: 1,
            overall_percentage: 1,
            feedback: 1,
            createdAt: 1,

            attempt: {
              mains_attempt_id: '$attempt.mains_attempt_id',
              date: '$attempt.date',
              time: '$attempt.time',
              answer_script_file: '$attempt.answer_script_file',
              status: '$attempt.status',
              attept_no: '$attempt.attempt.no',
            },

            user: {
              userId: '$user.userId',
              name: '$user.name',
              email: '$user.email',
              mobile_number: '$user.mobile_number',
            },

            subject: {
              mains_subject_test_id: '$subject.mains_subject_test_id',
              title: '$subject.title',
              no_of_qos: '$subject.no_of_qos',
              duration: '$subject.duration',
              marks: '$subject.marks',
            },

            mainsTest: {
              mains_test_id: '$mainsTest.mains_test_id',
              title: '$mainsTest.title',
              no_of_qs: '$mainsTest.no_of_qs',
              no_of_subjects: '$mainsTest.no_of_subjects',
              presentation_image: '$mainsTest.presentation_image',
            },
          },
        },
      ]);
      if (getDetails) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Details of Mains Attempt Result',
          data: getDetails,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Result Not found',
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
