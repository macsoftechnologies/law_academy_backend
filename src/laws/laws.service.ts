import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Law } from './schema/laws.schema';
import { Model } from 'mongoose';
import { lawsDto } from './dto/laws.dto';

@Injectable()
export class LawsService {
  constructor(@InjectModel(Law.name) private readonly lawModel: Model<Law>) {}

  async addLaw(req: lawsDto, image) {
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

        req.law_image = reqDoc.toString();
      }
      const add = await this.lawModel.create(req);
      if (add) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Law Added successfully',
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

  async getLaws(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const [getList, totalCount] = await Promise.all([
        this.lawModel.find().skip(skip).limit(limit),
        this.lawModel.countDocuments(),
      ]);
      const getlist = await this.lawModel.aggregate([
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
            from: 'categories',
            localField: 'categoryId',
            foreignField: 'categoryId',
            as: 'categoryId',
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]);
      return {
        statusCode: HttpStatus.OK,
        message: 'List of laws',
        totalCount: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
        data: getlist,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getBySubCategory(req: lawsDto) {
    try {
      const list = await this.lawModel.find({
        subcategory_id: req.subcategory_id,
      });
      if (list.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Laws list of subcategory',
          data: list,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Laws not found for this subcategory.',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async editLaw(req: lawsDto, image) {
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

        req.law_image = reqDoc.toString();
      }
      if (req.law_image) {
        const updateLecture = await this.lawModel.updateOne(
          { lawId: req.lawId },
          {
            $set: {
              title: req.title,
              law_image: req.law_image,
            },
          },
        );
        if (updateLecture.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Law Updated Successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Failed to update.',
          };
        }
      } else {
        const updateLecture = await this.lawModel.updateOne(
          { lawId: req.lawId },
          {
            $set: {
              title: req.title,
            },
          },
        );
        if (updateLecture.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Law Updated Successfully',
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

  async deleteLaw(req: lawsDto) {
    try {
      const remove = await this.lawModel.deleteOne({
        lawId: req.lawId,
      });
      if (remove) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Law has been removed successfully',
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
