import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PrelimesTest } from './schema/prelimes_tests.schema';
import { Model } from 'mongoose';
import { prelimesTestDto } from './dto/prelimes_tests.dto';
import { PrelimesAttempt } from './schema/prelimes_attempts.schema';
import { PrelimesQuestion } from './schema/prelimes_questions.schema';
import { PrelimesResults } from './schema/prelimes_results.schema';
import { prelimesQuestionDto } from './dto/prelimes_questions.dto';

@Injectable()
export class PrelimesTestsService {
  constructor(
    @InjectModel(PrelimesTest.name)
    private readonly prelimesTestModel: Model<PrelimesTest>,
    @InjectModel(PrelimesTest.name)
    private readonly prelimesAttemptModel: Model<PrelimesAttempt>,
    @InjectModel(PrelimesQuestion.name)
    private readonly prelimesQuestionModel: Model<PrelimesQuestion>,
    @InjectModel(PrelimesTest.name)
    private readonly prelimesResultModel: Model<PrelimesResults>,
  ) {}

  // Prelimes test APIs

  async addPrelimesTest(req: prelimesTestDto) {
    try {
      if (
        req.test_type == 'SMT' &&
        (!req.mocktest_subject_id || req.mocktest_subject_id == '')
      ) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Please provide subject wise mock test',
        };
      }
      const add = await this.prelimesTestModel.create(req);
      if (add) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Prelimes Test Added successfully',
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
        message: error.message,
      };
    }
  }

  async getPrelimesTestList(
    page?: number,
    limit?: number,
    prelimes_id?: string,
    test_type?: string,
    mocktest_subject_id?: string,
    userId?: string,
  ) {
    try {
      const VALID_TEST_TYPES = ['SMT', 'GT', 'QZ'];

      if (!test_type || !VALID_TEST_TYPES.includes(test_type)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Invalid test_type. Must be one of: ${VALID_TEST_TYPES.join(', ')}`,
        };
      }

      if (test_type === 'SMT' && !mocktest_subject_id) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'mocktest_subject_id is required when test_type is SMT',
        };
      }

      const pageNumber = page || 1;
      const pageLimit = limit || 10;
      const skip = (pageNumber - 1) * pageLimit;

      const matchStage: any = { test_type };

      if (test_type === 'SMT') {
        matchStage.mocktest_subject_id = mocktest_subject_id;
      }

      if (prelimes_id) {
        matchStage.prelimes_id = prelimes_id;
      }

      const lookupStage = userId
        ? [
            {
              $lookup: {
                from: 'prelimes_attempts',
                let: { testId: '$prelimes_test_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$prelimes_test_id', '$$testId'] },
                          { $eq: ['$userId', userId] },
                        ],
                      },
                    },
                  },
                ],
                as: 'attempts',
              },
            },
            {
              $addFields: {
                attempts_count: { $size: '$attempts' },
              },
            },
            { $project: { attempts: 0 } },
          ]
        : [];

      const pipeline = [
        { $match: matchStage },
        ...lookupStage,
        { $skip: skip },
        { $limit: pageLimit },
      ];

      const [data, totalCount] = await Promise.all([
        this.prelimesTestModel.aggregate(pipeline),
        this.prelimesTestModel.countDocuments(matchStage),
      ]);

      return {
        statusCode: HttpStatus.OK,
        message: 'Tests list fetched successfully',
        totalCount,
        page: pageNumber,
        limit: pageLimit,
        totalPages: Math.ceil(totalCount / pageLimit),
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async searchQuizzTests(req: prelimesTestDto) {
    try {
      const findsearch = await this.prelimesTestModel.find({
        $and: [
          { test_type: 'QZ' },
          { title: { $regex: req.title, $options: 'i' } },
        ],
      });
      if (findsearch.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of searched Quizzes',
          data: findsearch,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Quizzes not found based on search',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  // Prelimes Questions Apis
  async addprelimesQuestion(req: prelimesQuestionDto) {
    try {
      const addquestion = await this.prelimesQuestionModel.create({ ...req });
      if (addquestion) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Question added successfully',
          data: addquestion,
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'failed to add question',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getQuestionsByTest(
    page: number,
    limit: number,
    prelimes_test_id: string,
  ) {
    try {
      // Ensure valid numbers
      const pageNumber = Math.max(1, page || 1);
      const pageLimit = Math.max(1, limit || 10);

      const skip = (pageNumber - 1) * pageLimit;

      // Get paginated data
      const [questions, total] = await Promise.all([
        this.prelimesQuestionModel
          .find({ prelimes_test_id })
          .skip(skip)
          .limit(pageLimit)
          .lean(),

        this.prelimesQuestionModel.countDocuments({
          prelimes_test_id,
        }),
      ]);

      if (questions.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Questions list of the Test',
          totalCount: total,
          currentPage: pageNumber,
          limit: pageLimit,
          totalPages: Math.ceil(total / pageLimit),
          data: questions
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Questions not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getQuestion(req: prelimesQuestionDto) {
    try {
      const get_question = await this.prelimesQuestionModel.findOne({
        $and: [
          { prelimes_test_id: req.prelimes_test_id },
          { question_number: req.question_number },
        ],
      });
      if (get_question) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Question details',
          data: get_question,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Question not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async editQuestion(req: prelimesQuestionDto) {
    try {
      const updateQuestion = await this.prelimesQuestionModel.updateOne(
        { questionId: req.questionId },
        {
          $set: {
            question: req.question,
            options: req.options,
            correctAnswer: req.correctAnswer,
            marks: req.marks,
            summary: req.summary,
            question_number: req.question_number,
          },
        },
      );
      if (updateQuestion.modifiedCount > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Question updated successfully',
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

  async deleteQuestion(req: prelimesQuestionDto) {
    try {
      const removeQuestion = await this.prelimesQuestionModel.deleteOne({
        questionId: req.questionId,
      });
      if (removeQuestion) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Question deleted successfully',
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
