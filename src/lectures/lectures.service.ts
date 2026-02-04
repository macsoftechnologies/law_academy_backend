import { HttpStatus, Injectable } from '@nestjs/common';
import { Lecture } from './schema/lecture.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { lectureDto } from './dto/lecture.dto';

@Injectable()
export class LecturesService {
  constructor(
    @InjectModel(Lecture.name) private readonly lectureModel: Model<Lecture>,
  ) {}

  async createLecture(req: lectureDto) {
    try {
      const add = await this.lectureModel.create(req);
      if (add) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Lecture added successfully',
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

  async getLectures(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const [getList, totalCount] = await Promise.all([
        this.lectureModel.find().skip(skip).limit(limit),
        this.lectureModel.countDocuments(),
      ]);
      const getlist = await this.lectureModel.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: 'categoryId',
            as: 'categoryId',
          },
        },
        {
          $lookup: {
            from: 'subcategories',
            localField: 'subcategory_id',
            foreignField: 'subcategory_id',
            as: 'subcategory_id',
          },
        },
        {
          $lookup: {
            from: 'laws',
            localField: 'lawId',
            foreignField: 'lawId',
            as: 'lawId',
          },
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjectId',
            foreignField: 'subjectId',
            as: 'subjectId',
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]);
      if (getlist.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of lectures',
          totalCount: totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          limit,
          data: getlist,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No sub categories found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getLectureDetails(req: lectureDto) {
    try {
      const details = await this.lectureModel.findOne({
        lectureId: req.lectureId,
      });
      if (details) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Details of Lecture',
          data: details,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Lecture not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getLecturesBySubject(req: lectureDto) {
    try {
      const lectures = await this.lectureModel.aggregate([
        {
          $match: {
            subjectId: req.subjectId,
          },
        },

        {
          $lookup: {
            from: 'enrollments',
            let: {
              subjectId: req.subjectId,
              subcategoryId: req.subcategory_id,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', req.userId] },
                      { $eq: ['$status', 'active'] },
                      {
                        $or: [
                          {
                            $and: [
                              { $eq: ['$enroll_type', 'subject-wise'] },
                              { $eq: ['$course_id', '$$subjectId'] },
                            ],
                          },
                          {
                            $and: [
                              { $eq: ['$enroll_type', 'full-course'] },
                              { $eq: ['$course_id', '$$subcategoryId'] },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'enrollment',
          },
        },

        {
          $addFields: {
            enrollment: { $arrayElemAt: ['$enrollment', 0] },
          },
        },

        {
          $addFields: {
            isLocked: {
              $cond: [
                { $ifNull: ['$enrollment', false] },
                false,
                '$isLocked',
              ],
            },
          },
        },

        {
          $project: {
            enrollment: 0,
          },
        },
      ]);

      if (lectures.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Lectures list of the subject',
          data: lectures,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Lectures not found of this subject',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  async editLecture(req: lectureDto) {
    try {
      const updateLecture = await this.lectureModel.updateOne(
        { lectureId: req.lectureId },
        {
          $set: {
            lecture_no: req.lecture_no,
            title: req.title,
            author: req.author,
            description: req.description,
            video_url: req.video_url,
            thumbnail_image_url: req.thumbnail_image_url,
            notes_pdf_url: req.notes_pdf_url,
            subjectId: req.subjectId,
            lawId: req.lawId,
            subcategory_id: req.subcategory_id,
            categoryId: req.categoryId,
            isLocked: req.isLocked,
          },
        },
      );
      if (updateLecture.modifiedCount > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Updated successfully',
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

  async deleteLecture(req: lectureDto) {
    try {
      const deleteLecture = await this.lectureModel.deleteOne({
        lectureId: req.lectureId,
      });
      if (deleteLecture) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Deleted successfully',
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
