import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GuestLecture } from './schema/guest_lecture.schema';
import { Model } from 'mongoose';
import { guestLectureDto } from './dto/guest_lecture.dto';
import { Enrollment } from 'src/enrollments/schema/enrollment.schema';

@Injectable()
export class GuestLecturesService {
  constructor(
    @InjectModel(GuestLecture.name)
    private readonly guestLectureModel: Model<GuestLecture>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
  ) {}

  async addGuestLecture(req: guestLectureDto, image) {
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
      const add = await this.guestLectureModel.create(req);
      if (add) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Guest Lecture added Successfully',
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
        message: error,
      };
    }
  }

  async getGuestLecturesList(
    userId: string,
    page: number,
    limit: number,
  ) {
    try {
      const skip = (page - 1) * limit;

      const hasFullCourse = await this.enrollmentModel.exists({
        userId,
        enroll_type: 'full-course',
        status: 'active',
      });

      const [lectures, totalCount] = await Promise.all([
        this.guestLectureModel.find().skip(skip).limit(limit).lean(),
        this.guestLectureModel.countDocuments(),
      ]);

      const finalData = lectures.map((lecture) => ({
        ...lecture,
        isLocked: hasFullCourse ? false : lecture.isLocked,
      }));

      return {
        statusCode: HttpStatus.OK,
        message: 'List of Guest Lectures',
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
        data: finalData,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  async getGuestLectureById(req: guestLectureDto) {
    try {
      const getlecture = await this.guestLectureModel.findOne({
        guest_lecture_id: req.guest_lecture_id,
      });
      if (getlecture) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Guest Lecture Details',
          data: getlecture,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Guest Lecture not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async editGuestLecture(req: guestLectureDto, image) {
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
        const updateLecture = await this.guestLectureModel.updateOne(
          { guest_lecture_id: req.guest_lecture_id },
          {
            $set: {
              title: req.title,
              author: req.author,
              duration: req.duration,
              about_class: req.about_class,
              about_lecture: req.about_lecture,
              video_url: req.video_url,
              presentation_image: req.presentation_image,
              isLocked: req.isLocked,
            },
          },
        );
        if (updateLecture.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Guest Lecture Updated Successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Failed to update.',
          };
        }
      } else {
        const updateLecture = await this.guestLectureModel.updateOne(
          { guest_lecture_id: req.guest_lecture_id },
          {
            $set: {
              title: req.title,
              author: req.author,
              duration: req.duration,
              about_class: req.about_class,
              about_lecture: req.about_lecture,
              video_url: req.video_url,
            },
          },
        );
        if (updateLecture.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Guest Lecture Updated Successfully',
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

  async deleteGuestLecture(req: guestLectureDto) {
    try {
      const remove = await this.guestLectureModel.deleteOne({
        guest_lecture_id: req.guest_lecture_id,
      });
      if (remove) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Guest Lecture has been removed successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to delete guest lecture.',
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
