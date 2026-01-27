import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Subject } from './schema/subject.schema';
import { Model } from 'mongoose';
import { subjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
    constructor(@InjectModel(Subject.name) private readonly subjectModel: Model<Subject>) {}

  async addSubject(req: subjectDto, image) {
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

        req.subject_image = reqDoc.toString();
      }
      const add = await this.subjectModel.create(req);
      if (add) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Subject Added successfully',
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
        message: error,
      };
    }
  }

  async getSubjects(page: number, limit: number) {
    try{
        const skip = (page - 1) * limit;

      const [getList, totalCount] = await Promise.all([
        this.subjectModel.find().skip(skip).limit(limit),
        this.subjectModel.countDocuments(),
      ]);
      return {
        statusCode: HttpStatus.OK,
        message: 'List of Subjects',
        totalCount: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
        data: getList,
      };
    } catch(error) {
        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error,
        }
    }
  }

  async getByLaw(req: subjectDto) {
    try{
        const list = await this.subjectModel.find({law_id: req.law_id});
        if(list.length > 0) {
            return {
                statusCode: HttpStatus.OK,
                message: "Subjects list of law",
                data: list,
            }
        } else {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                message: "Subjects not found for this law."
            }
        }
    } catch(error) {
        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error,
        }
    }
  }


  async editSubject(req: subjectDto, image) {
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

          req.subject_image = reqDoc.toString();
        }
      if (req.subject_image) {
        const updateLecture = await this.subjectModel.updateOne(
          { subjectId: req.subjectId },
          {
            $set: {
              title: req.title,
              subject_image: req.subject_image,
            },
          },
        );
        if (updateLecture.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Subject Updated Successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Failed to update.',
          };
        }
      } else {
        const updateLecture = await this.subjectModel.updateOne(
          { subjectId: req.subjectId },
          {
            $set: {
              title: req.title
            },
          },
        );
        if (updateLecture.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Subject Updated Successfully',
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

  async deleteSubject(req: subjectDto) {
    try {
      const remove = await this.subjectModel.deleteOne({
        subjectId: req.subjectId,
      });
      if (remove) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Subject has been removed successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to delete',
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
