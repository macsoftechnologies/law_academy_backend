import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QAModule } from './schema/qa.schema';
import { Model } from 'mongoose';
import { qaDto } from './dto/qa.dto';

@Injectable()
export class QaService {
  constructor(
    @InjectModel(QAModule.name) private readonly QAModel: Model<QAModule>,
  ) {}

  async addQA(req: qaDto, image) {
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
      const add = await this.QAModel.create(req);
      if (add) {
        return {
          statusCode: HttpStatus.OK,
          message: 'QA added successfully',
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

  async getQAByModule(
    req: qaDto,
    userId?: string,
    pageParam?: string,
    limitParam?: string,
  ) {
    try {
      const page = pageParam && Number(pageParam) > 0 ? Number(pageParam) : 1;
      const limit =
        limitParam && Number(limitParam) > 0 ? Number(limitParam) : 10;
      const skip = (page - 1) * limit;

      const match: any = {
        module: req.module,
        module_type: req.module_type,
      };

      if (req.module_id) {
        match.module_id = req.module_id;
      }

      const pipeline: any[] = [{ $match: match }];

      if (userId) {
        pipeline.push(
          {
            $lookup: {
              from: 'enrollments',
              let: { userId },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$userId', '$$userId'] },
                        { $eq: ['$status', 'active'] },
                      ],
                    },
                  },
                },
              ],
              as: 'enrollments',
            },
          },
          {
            $addFields: {
              hasFullCourse: {
                $in: ['full-course', '$enrollments.enroll_type'],
              },
              hasModuleAccess: {
                $in: [req.module, '$enrollments.enroll_type'],
              },
            },
          },
          {
            $addFields: {
              isLocked: {
                $cond: [
                  { $or: ['$hasFullCourse', '$hasModuleAccess'] },
                  false,
                  '$isLocked',
                ],
              },
            },
          },
          {
            $project: {
              enrollments: 0,
              hasFullCourse: 0,
              hasModuleAccess: 0,
            },
          },
        );
      }

      pipeline.push({
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      });

      const result = await this.QAModel.aggregate(pipeline);

      const data = result[0]?.data || [];
      const totalCount = result[0]?.totalCount[0]?.count || 0;

      const messageMap = {
        PQA: 'Previous Question & Answers',
        MQA: 'Mains Question & Answers',
        MET: 'Mains Essays & Translations',
      };

      return {
        statusCode: HttpStatus.OK,
        message: `List of ${messageMap[req.module_type]}`,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getQAById(req: qaDto) {
    try {
      const getDetails = await this.QAModel.findOne({
        qa_id: req.qa_id,
      }).lean();
      if (getDetails) {
        let message_type;
        if (getDetails.module_type == 'PQA') {
          message_type = 'Previous Question & Answers';
        } else if (getDetails.module_type == 'MQA') {
          message_type = 'Mains Question & Answers';
        } else {
          message_type = 'Mains Essays & Translations';
        }
        return {
          statusCode: HttpStatus.OK,
          message: `Details of ${message_type}`,
          data: {
            ...getDetails,
            module_type: message_type,
          },
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async updateQA(req: qaDto, image) {
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
        const editQA = await this.QAModel.updateOne(
          { qa_id: req.qa_id },
          {
            $set: {
              title: req.title,
              no_of_qs: req.no_of_qs,
              presentation_image: req.presentation_image,
              video_url: req.video_url,
              pdf_url: req.pdf_url,
              duration: req.duration,
              isLocked: req.isLocked,
            },
          },
        );
        if (editQA.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'QA Updated successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'failed to update.',
          };
        }
      } else {
        const editQA = await this.QAModel.updateOne(
          { qa_id: req.qa_id },
          {
            $set: {
              title: req.title,
              no_of_qs: req.no_of_qs,
              video_url: req.video_url,
              pdf_url: req.pdf_url,
              duration: req.duration,
              isLocked: req.isLocked,
            },
          },
        );
        if (editQA.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'QA Updated successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'failed to update.',
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

  async deleteQA(req: qaDto) {
    try {
      const remove = await this.QAModel.deleteOne({ qa_id: req.qa_id });
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
        message: error.message,
      };
    }
  }
}
