import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubCategory } from '../schema/subcategory.schema';
import { Model } from 'mongoose';
import { subCategoryDto } from '../dto/subcategory.dto';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategory>,
  ) {}

  async addsubcategory(req: subCategoryDto, image) {
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
      const addcategory = await this.subCategoryModel.create(req);
      if (addcategory) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Sub Category added successfully',
          data: addcategory,
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

  async getSubCategories(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const [getList, totalCount] = await Promise.all([
        this.subCategoryModel.find().skip(skip).limit(limit),
        this.subCategoryModel.countDocuments(),
      ]);
      const getlist = await this.subCategoryModel.aggregate([
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
      if (getlist.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of SubCategories',
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

  async getSubCategoriesByCategory(req: subCategoryDto) {
    try {
      const getlist = await this.subCategoryModel.find({
        categoryId: req.categoryId,
      });
      if (getlist.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of Sub categories By Categories',
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

  async getSubCategoriesByCategoryWithuser(req: subCategoryDto) {
    try {
      const today = new Date();

      const data = await this.subCategoryModel.aggregate([
        {
          $match: {
            categoryId: req.categoryId,
          },
        },
        {
          $lookup: {
            from: 'enrollments',
            let: { subcategoryId: '$subcategory_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$course_id', '$$subcategoryId'] },
                      { $eq: ['$userId', req.userId] },
                      { $eq: ['$enroll_type', 'full-course'] },
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
            enrolledDateClean: {
              $cond: [
                { $ifNull: ['$enrollment.enroll_date', false] },
                {
                  $replaceAll: {
                    input: '$enrollment.enroll_date',
                    find: ' (India Standard Time)',
                    replacement: '',
                  },
                },
                null,
              ],
            },
            expiryDateClean: {
              $cond: [
                { $ifNull: ['$enrollment.expiry_date', false] },
                {
                  $replaceAll: {
                    input: '$enrollment.expiry_date',
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
            enrolledDateObj: {
              $cond: [
                { $ifNull: ['$enrolledDateClean', false] },
                {
                  $dateFromString: {
                    dateString: '$enrolledDateClean',
                    onError: null,
                    onNull: null,
                  },
                },
                null,
              ],
            },
            expiryDateObj: {
              $cond: [
                { $ifNull: ['$expiryDateClean', false] },
                {
                  $dateFromString: {
                    dateString: '$expiryDateClean',
                    onError: null,
                    onNull: null,
                  },
                },
                null,
              ],
            },
          },
        },
        {
          $addFields: {
            isEnrolled: {
              $cond: [{ $ifNull: ['$enrollment', false] }, true, false],
            },

            remaining_duration: {
              $cond: [
                { $ifNull: ['$expiryDateObj', false] },
                {
                  $max: [
                    0,
                    {
                      $ceil: {
                        $divide: [
                          { $subtract: ['$expiryDateObj', today] },
                          1000 * 60 * 60 * 24,
                        ],
                      },
                    },
                  ],
                },
                null,
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'plans',
            localField: 'subcategory_id',
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
            presentation_image: 1,
            title: 1,
            about_course: 1,
            terms_conditions: 1,
            subcategory_id: 1,
            categoryId: 1,
            isEnrolled: 1,
            enroll_date: '$enrolledDateObj',
            expiry_date: '$expiryDateObj',
            remaining_duration: 1,
            status: '$enrollment.status',
            availablePlans: 1,
          },
        },
      ]);

      if (data.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Subcategories with enrollment details',
          data,
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
        message: error.message || error,
      };
    }
  }

  async getsubcategoryById(req: subCategoryDto) {
    try {
      const findCategory = await this.subCategoryModel.findOne({
        subcategory_id: req.subcategory_id,
      });
      if (findCategory) {
        return {
          statusCode: HttpStatus.OK,
          message: 'SubCategory Details',
          data: findCategory,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'SubCategory not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async updateSubCategory(req: subCategoryDto, image) {
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
        const editCategory = await this.subCategoryModel.updateOne(
          { subcategory_id: req.subcategory_id },
          {
            $set: {
              title: req.title,
              about_course: req.about_course,
              terms_conditions: req.terms_conditions,
              presentation_image: req.presentation_image,
            },
          },
        );
        if (editCategory.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'SubCategory updated successfully',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'failed to update',
          };
        }
      } else {
        const editCategory = await this.subCategoryModel.updateOne(
          { subcategory_id: req.subcategory_id },
          {
            $set: {
              title: req.title,
              about_course: req.about_course,
              terms_conditions: req.terms_conditions,
            },
          },
        );
        if (editCategory.modifiedCount > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'SubCategory updated successfully',
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

  async deleteSubCategory(req: subCategoryDto) {
    try {
      const removeCategory = await this.subCategoryModel.deleteOne({
        subcategory_id: req.subcategory_id,
      });
      if (removeCategory) {
        return {
          statusCode: HttpStatus.OK,
          message: 'SubCategory delete successfully',
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
