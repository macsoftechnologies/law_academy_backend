import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubjectNotes } from './schema/subject_notes.schema';
import { Model } from 'mongoose';
import { subjectNotesDto } from './dto/subject_notes.dto';
import { Enrollment } from 'src/enrollments/schema/enrollment.schema';

@Injectable()
export class SubjectNotesService {
  constructor(
    @InjectModel(SubjectNotes.name)
    private readonly subjectNotesModel: Model<SubjectNotes>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
  ) {}

  async addSubjectNotes(req: subjectNotesDto, image) {
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
      const addnotes = await this.subjectNotesModel.create(req);
      return addnotes;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getSubjectNotesList(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const totalCount = await this.subjectNotesModel.countDocuments();

      const list = await this.subjectNotesModel.aggregate([
        {
          $lookup: {
            from: 'notes',
            localField: 'notes_id',
            foreignField: 'notes_id',
            as: 'notes_id',
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
        { $skip: skip },
        { $limit: limit },
      ]);

      return {
        statusCode: HttpStatus.OK,
        message: 'List of Subject Notes',
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
        data: list,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  async notesByLaw(req: subjectNotesDto) {
    try {
      const hasAccess = await this.enrollmentModel.exists({
        userId: req.userId,
        enroll_type: { $in: ['full-course', 'notes'] },
        status: 'active',
      });

      const getlist = await this.subjectNotesModel.aggregate([
        {
          $match: {
            lawId: req.lawId
          },
        },
        {
          $addFields: {
            isLocked: {
              $cond: {
                if: hasAccess,
                then: false,
                else: '$isLocked',
              },
            },
          },
        },
      ]);

      if (getlist.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Subject notes of law',
          data: getlist,
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
        message: error.message || error,
      };
    }
  }

  async editSubjectNotes(req: subjectNotesDto, image) {
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
        const addnotes = await this.subjectNotesModel.updateOne(
          { subject_notes_id: req.subject_notes_id },
          {
            $set: {
              notes_id: req.notes_id,
              lawId: req.lawId,
              title: req.title,
              pdf_url: req.pdf_url,
              isLocked: req.isLocked,
              presentation_image: req.presentation_image,
            },
          },
        );
        if (addnotes.modifiedCount > 0) {
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
        const addnotes = await this.subjectNotesModel.updateOne(
          { subject_notes_id: req.subject_notes_id },
          {
            $set: {
              notes_id: req.notes_id,
              lawId: req.lawId,
              title: req.title,
              pdf_url: req.pdf_url,
              isLocked: req.isLocked,
            },
          },
        );
        if (addnotes.modifiedCount > 0) {
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
        message: error,
      };
    }
  }

  async deleteSubjectNotes(req: subjectNotesDto) {
    try {
      const removenotes = await this.subjectNotesModel.deleteOne({
        subject_notes_id: req.subject_notes_id,
      });
      if (removenotes) {
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
