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
    @InjectModel(PrelimesQuestion.name)
    private readonly prelimesQuestionModel: Model<PrelimesQuestion>,
    @InjectModel(PrelimesAttempt.name)
    private readonly attemptModel: Model<PrelimesAttempt>,
    @InjectModel(PrelimesResults.name)
    private readonly resultModel: Model<PrelimesResults>,
  ) { }

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

      const pageNumber = page || 1;
      const pageLimit = limit || 10;
      const skip = (pageNumber - 1) * pageLimit;

      const matchStage: any = { test_type };

      if (test_type === 'SMT' && mocktest_subject_id) {
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

  // attempts apis


  async startAttempt(dto: { userId: string; testId: string }) {
    const count = await this.attemptModel.countDocuments({
      userId: dto.userId,
      testId: dto.testId,
    });

    const attempt = await this.attemptModel.create({
      userId: dto.userId,
      testId: dto.testId,
      attemptNumber: count + 1, // 🔥 KEY
      answers: [],
      startedAt: new Date(),
    });

    return {
      statusCode: 200,
      message: 'Attempt started',
      data: attempt,
    };
  }

  async saveAnswer(attemptId: string, dto: any) {
    const attempt = await this.attemptModel.findOne({prelimes_attempt_id: attemptId});

    if (!attempt) {
      return { statusCode: 404, message: 'Attempt not found' };
    }

    const existingIndex = attempt.answers.findIndex(
      (a) => a.questionId === dto.questionId,
    );

    if (existingIndex > -1) {
      // 🔥 UPDATE EXISTING ANSWER
      attempt.answers[existingIndex].selectedAnswer = dto.selectedAnswer;
    } else {
      // ➕ ADD NEW ANSWER
      attempt.answers.push({
        questionId: dto.questionId,
        selectedAnswer: dto.selectedAnswer,
        isCorrect: false,
      });
    }

    await attempt.save();

    return {
      statusCode: 200,
      message: 'Answer saved',
      data: attempt,
    };
  }

  async submitAttempt(prelimes_attempt_id: string) {
    const attempt = await this.attemptModel.findOne({prelimes_attempt_id: prelimes_attempt_id});

    if (!attempt) {
      return { statusCode: 404, message: 'Attempt not found' };
    }

    if (attempt.submittedAt) {
      return { statusCode: 400, message: 'Already submitted' };
    }

    attempt.submittedAt = new Date();
    
    const test = await this.prelimesTestModel.findOne({prelimes_test_id: attempt.testId});
    const testDuration = parseInt(test?.duration ?? '0');

    const questions = await this.prelimesQuestionModel.find({
      prelimes_test_id: attempt.testId,
    });

    const qMap = new Map(questions.map(q => [q.questionId, q]));

    const answerMap = new Map();
    for (const ans of attempt.answers || []) {
      answerMap.set(ans.questionId, ans);
    }

    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let attempted = 0;

    for (const q of questions) {
      const ans = answerMap.get(q.questionId);

      if (!ans || ans.selectedAnswer == null) {
        skipped++;
        continue;
      }

      attempted++;

      if (ans.selectedAnswer === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    }

    const totalQuestions = questions.length;
    const score = correct;

    const accuracy = attempted
      ? (correct / attempted) * 100
      : 0;

    const percentage = (score / totalQuestions) * 100;

    const timeSpent =
      (attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000;

    await attempt.save();

    const result = await this.resultModel.create({
      userId: attempt.userId,
      testId: attempt.testId,
      attemptId: attempt.prelimes_attempt_id,
      totalQuestions,
      attempted,
      correct,
      wrong,
      skipped,
      score,
      percentage,
      accuracy,
      timeSpent,
      totalTime: testDuration
    });

    const betterScores = await this.resultModel.countDocuments({
      testId: attempt.testId,
      score: { $gt: score },
    });

    const totalParticipants = await this.resultModel.countDocuments({
      testId: attempt.testId,
    });

    const rank = betterScores + 1;

    const percentile =
      totalParticipants > 0
        ? (1 - rank / totalParticipants) * 100
        : 0;

    result.rank = rank;
    result.totalParticipants = totalParticipants;
    result.percentile = Number(percentile.toFixed(1));

    await result.save();

    return {
      statusCode: 200,
      message: 'Submitted successfully',
      data: {
        score,
        totalQuestions,
        timeSpent,
        totalTime: result.totalTime,
        rank,
        totalParticipants,
        percentile: result.percentile,
        accuracy: Number(accuracy.toFixed(1)),
        attemptNumber: attempt.attemptNumber,
      },
    };
  }

  async getAttempt(prelimes_attempt_id: string) {
    const attempt = await this.resultModel.findOne({attemptId: prelimes_attempt_id});

    return {
      statusCode: 200,
      data: attempt,
    };
  }
}
