import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notes } from './schema/notes.schema';
import { Model } from 'mongoose';
import { notesDto } from './dto/notes.dto';
import { AuthService } from 'src/auth/auth.service';
import { Enrollment } from 'src/enrollments/schema/enrollment.schema';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Notes.name) private readonly notesModel: Model<Notes>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Notes>,
    private readonly authService: AuthService,
  ) {}

  async addNotes(req: notesDto, image) {
    try {
      if (image) {
        if (image.presentation_image && image.presentation_image[0]) {
          req.presentation_image = await this.authService.saveFile(
            image.presentation_image[0],
          );
        }

        if (image.printNotes_image && image.printNotes_image[0]) {
          req.printNotes_image = await this.authService.saveFile(
            image.printNotes_image[0],
          );
        }
      }
      const AboutBook = JSON.parse(req.about_book);
      const add = await this.notesModel.create({
        ...req,
        about_book: AboutBook,
      });
      if (add) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Notes added Successfully',
          data: add,
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to add',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      };
    }
  }

  async getNotesList(page: number, limit: number, userId: string) {
    try {
      const skip = (page - 1) * limit;
      const today = new Date();
      const fullCourseEnrollment = await this.enrollmentModel.findOne({
        userId,
        enroll_type: 'full-course',
        status: 'active',
      });

      const data = await this.notesModel.aggregate([
        { $skip: skip },
        { $limit: limit },

        {
          $lookup: {
            from: 'enrollments',
            let: { notesId: '$notes_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', userId] },
                      { $eq: ['$status', 'active'] },
                      { $eq: ['$enroll_type', 'notes'] },
                      { $eq: ['$course_id', '$$notesId'] },
                    ],
                  },
                },
              },
            ],
            as: 'notesEnrollment',
          },
        },

        {
          $addFields: {
            notesEnrollment: { $arrayElemAt: ['$notesEnrollment', 0] },
          },
        },

        {
          $addFields: {
            finalEnrollment: fullCourseEnrollment
              ? fullCourseEnrollment
              : '$notesEnrollment',

            isEnrolled: fullCourseEnrollment
              ? true
              : {
                  $cond: [
                    { $ifNull: ['$notesEnrollment', false] },
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
            localField: 'notes_id',
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
            notes_id: 1,
            subcategory_id: 1,

            isEnrolled: 1,
            enroll_date: '$finalEnrollment.enroll_date',
            expiry_date: '$expiryDateObj',
            remaining_duration: 1,

            availablePlans: 1,
          },
        },
      ]);

      const totalCount = await this.notesModel.countDocuments();

      return {
        statusCode: HttpStatus.OK,
        message: 'List of Notes',
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

  async getNotesById(req: notesDto) {
    try {
      const getlecture = await this.notesModel.findOne({
        notes_id: req.notes_id,
      });
      if (getlecture) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Notes Details',
          data: getlecture,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Notes not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async editNotes(req: notesDto, image) {
    try {
      if (image) {
        if (image.presentation_image && image.presentation_image[0]) {
          req.presentation_image = await this.authService.saveFile(
            image.presentation_image[0],
          );
        }

        if (image.printNotes_image && image.printNotes_image[0]) {
          req.printNotes_image = await this.authService.saveFile(
            image.printNotes_image[0],
          );
        }
      }
      const AboutBook = JSON.parse(req.about_book);
      if (req.presentation_image || req.printNotes_image) {
        const updateLecture = await this.notesModel.updateOne(
          { notes_id: req.notes_id },
          {
            $set: {
              title: req.title,
              sub_title: req.sub_title,
              presentation_image: req.presentation_image,
              about_book: AboutBook,
              printNotes_image: req.printNotes_image,
              isPrintAvail: req.isPrintAvail,
              terms_conditions: req.terms_conditions,
              subcategory_id: req.subcategory_id,
            },
          },
        );
        if (updateLecture.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Notes Updated Successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Failed to update.',
          };
        }
      } else {
        const updateLecture = await this.notesModel.updateOne(
          { notes_id: req.notes_id },
          {
            $set: {
              title: req.title,
              sub_title: req.sub_title,
              about_book: AboutBook,
              isPrintAvail: req.isPrintAvail,
              terms_conditions: req.terms_conditions,
              subcategory_id: req.subcategory_id,
            },
          },
        );
        if (updateLecture.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Notes Updated Successfully',
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

  async deleteNotes(req: notesDto) {
    try {
      const remove = await this.notesModel.deleteOne({
        notes_id: req.notes_id,
      });
      if (remove) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Notes has been removed successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to delete Notes.',
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
