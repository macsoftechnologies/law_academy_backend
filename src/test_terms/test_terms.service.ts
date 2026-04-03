import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TestTerms } from './schema/test_terms.schema';
import { Model } from 'mongoose';
import { testTermsDto } from './dto/test_terms.dto';

@Injectable()
export class TestTermsService {
  constructor(
    @InjectModel(TestTerms.name)
    private readonly testTermModel: Model<TestTerms>,
  ) {}

  async createTerm(req: testTermsDto) {
    try {
      const add = await this.testTermModel.create(req);
      if (add) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Test Terms and Conditions addded successfully',
          data: add,
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'failed to add test terms and conditions',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getTerms(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const [getList, totalCount] = await Promise.all([
        this.testTermModel.find().skip(skip).limit(limit),
        this.testTermModel.countDocuments(),
      ]);
      return {
        statusCode: HttpStatus.OK,
        message: 'List of Terms and Conditions',
        totalCount: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
        data: getList,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getbyType(req: testTermsDto) {
    try {
      const getbytype = await this.testTermModel.find({
        testType: req.testType,
      });
      if (getbytype.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Terms and Conditions of the requested type.',
          data: getbytype,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No terms and consditions found.',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async updateTerms(req: testTermsDto) {
    try {
      const editTerm = await this.testTermModel.updateOne(
        { test_term_id: req.test_term_id },
        {
          $set: {
            terms_conditions: req.terms_conditions,
            testType: req.testType,
            instructions: req.instructions,
          },
        },
      );
      if (editTerm.modifiedCount > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Terms and Conditions Updated successfully',
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

  async deleteTerm(req: testTermsDto) {
    try {
      const findTerm = await this.testTermModel.findOne({
        test_term_id: req.test_term_id,
      });
      if (!findTerm) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Terms and Conditions Not found',
        };
      }
      const removeterm = await this.testTermModel.deleteOne({
        test_term_id: req.test_term_id,
      });
      if (removeterm) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Terms and Conditions removed successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to delete Terms and Conditions',
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
