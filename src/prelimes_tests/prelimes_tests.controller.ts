import { Body, Controller, Get, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { exportToCsvString, exportToExcelBuffer } from 'src/utils/export.util';
import { PrelimesTestsService } from './prelimes_tests.service';
import { prelimesTestDto } from './dto/prelimes_tests.dto';
import { prelimesQuestionDto } from './dto/prelimes_questions.dto';
import { StartAttemptDto } from './dto/prelimes_attempts.dto';

@Controller('prelimes-tests')
export class PrelimesTestsController {
  constructor(private readonly prelimesTestsService: PrelimesTestsService) { }

  // Prelimes Test Apis

  @Post('/add')
  async createPrelimesTest(@Body() req: prelimesTestDto) {
    try {
      const add = await this.prelimesTestsService.addPrelimesTest(req);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Get('/')
  async getPrelimesTestList(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('prelimes_id') prelimes_id?: string,
    @Query('test_type') test_type?: string,
    @Query('mocktest_subject_id') mocktest_subject_id?: string,
    @Query('userId') userId?: string,
  ) {
    try {
      const add = await this.prelimesTestsService.getPrelimesTestList(
        Number(page),
        Number(limit),
        prelimes_id,
        test_type,
        mocktest_subject_id,
        userId,
      );
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('/search_quizz')
  async searchQuizz(@Body() req: prelimesTestDto) {
    try {
      const search = await this.prelimesTestsService.searchQuizzTests(req);
      return search;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  // Prelimes Question Apis
  @Post('/addquestion')
  async addQuestion(@Body() req: prelimesQuestionDto) {
    try {
      const add = await this.prelimesTestsService.addprelimesQuestion(req);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Get('/getquestionlist')
  async getQuestionsListByTest(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('prelimes_test_id') prelimes_test_id: string
  ) {
    try {
      const list = await this.prelimesTestsService.getQuestionsByTest(
        Number(page),
        Number(limit),
        String(prelimes_test_id)
      );
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('/question')
  async getQuestionDetails(@Body() req: prelimesQuestionDto) {
    try {
      const question = await this.prelimesTestsService.getQuestion(req);
      return question;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('/updatequestion')
  async updateQuestionDetails(@Body() req: prelimesQuestionDto) {
    try {
      const question = await this.prelimesTestsService.editQuestion(req);
      return question;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('/deletequestion')
  async removeQuestion(@Body() req: prelimesQuestionDto) {
    try {
      const question = await this.prelimesTestsService.deleteQuestion(req);
      return question;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('start_attempt')
  start(@Body() body: any) {
    return this.prelimesTestsService.startAttempt(body);
  }

  @Post(':id/answer')
  saveAnswer(@Param('id') id: string, @Body() body: any) {
    return this.prelimesTestsService.saveAnswer(id, body);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.prelimesTestsService.submitAttempt(id);
  }

  @Get('/attempts')
  getAttempts(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('test_type') test_type: string,
  ) {
    return this.prelimesTestsService.getAttemptsList(
      Number(page),
      Number(limit),
      test_type,
    );
  }

  @Get('/attempts/export')
  async exportAttempts(
    @Res() res: Response,
    @Query('test_type') test_type?: string,
    @Query('format') format = 'excel',
  ) {
    try {
      const attempts = await this.prelimesTestsService.getAttemptsForExport(test_type);

      const headers = [
        'Attempt ID',
        'Student ID',
        'Student Name',
        'Student Email',
        'Student Mobile Number',
        'Test ID',
        'Test Title',
        'Test Type',
        'Attempt Number',
        'Started At',
        'Submitted At',
        'Total Questions',
        'Attempted',
        'Correct',
        'Wrong',
        'Skipped',
        'Score',
        'Percentage',
        'Accuracy',
        'Time Spent (sec)',
        'Rank',
        'Total Participants',
        'Percentile'
      ];

      const testTypeMap: Record<string, string> = {
        'SMT': 'Subject-wise Mock Test',
        'GT': 'Grand Test',
        'QZ': 'Quiz'
      };

      const rows = attempts.map(attempt => [
        attempt.prelimes_attempt_id || '',
        attempt.userId?.userId || '',
        attempt.userId?.name || '',
        attempt.userId?.email || '',
        attempt.userId?.mobile_number || '',
        attempt.testId?.prelimes_test_id || '',
        attempt.testId?.title || '',
        testTypeMap[attempt.testId?.test_type] || attempt.testId?.test_type || '',
        attempt.attemptNumber || '',
        attempt.startedAt ? new Date(attempt.startedAt).toLocaleString() : '',
        attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : '',
        attempt.result?.totalQuestions ?? '',
        attempt.result?.attempted ?? '',
        attempt.result?.correct ?? '',
        attempt.result?.wrong ?? '',
        attempt.result?.skipped ?? '',
        attempt.result?.score ?? '',
        attempt.result?.percentage != null ? `${attempt.result.percentage}%` : '',
        attempt.result?.accuracy != null ? `${attempt.result.accuracy}%` : '',
        attempt.result?.timeSpent ?? '',
        attempt.result?.rank ?? '',
        attempt.result?.totalParticipants ?? '',
        attempt.result?.percentile ?? ''
      ]);

      const filenamePrefix = test_type ? `prelimes_${test_type.toLowerCase()}_attempts` : 'prelimes_all_attempts';

      if (format === 'csv') {
        const csvString = exportToCsvString(headers, rows);
        const buffer = Buffer.from(csvString, 'utf-8');
        res.set({
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenamePrefix}_export.csv"`,
          'Content-Length': buffer.length,
        });
        return res.end(buffer);
      } else {
        const buffer = exportToExcelBuffer(headers, rows, 'Prelims Attempts');
        res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filenamePrefix}_export.xlsx"`,
          'Content-Length': buffer.length,
        });
        return res.end(buffer);
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.prelimesTestsService.getAttempt(id);
  }

  @Post('/user_attempts')
  getUserAtetmpts(@Body() req: StartAttemptDto) {
    return this.prelimesTestsService.getUserTestAttempts(req);
  }

  @Get('/user_attempts/export')
  async exportUserAttempts(
    @Res() res: Response,
    @Query('userId') userId: string,
    @Query('testId') testId: string,
    @Query('format') format = 'excel',
  ) {
    if (!userId || !testId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'userId and testId query parameters are required',
      });
    }

    try {
      const attempts = await this.prelimesTestsService.getUserTestAttemptsForExport(userId, testId);

      const headers = [
        'Attempt ID',
        'Student ID',
        'Student Name',
        'Student Email',
        'Student Mobile Number',
        'Test ID',
        'Test Title',
        'Test Type',
        'Attempt Number',
        'Started At',
        'Submitted At',
        'Total Questions',
        'Attempted',
        'Correct',
        'Wrong',
        'Skipped',
        'Score',
        'Percentage',
        'Accuracy',
        'Time Spent (sec)',
        'Rank',
        'Total Participants',
        'Percentile'
      ];

      const testTypeMap: Record<string, string> = {
        'SMT': 'Subject-wise Mock Test',
        'GT': 'Grand Test',
        'QZ': 'Quiz'
      };

      const rows = attempts.map(attempt => [
        attempt.prelimes_attempt_id || '',
        attempt.userId || '',
        attempt.user?.name || '',
        attempt.user?.email || '',
        attempt.user?.mobile_number || '',
        attempt.testId || '',
        attempt.testInfo?.title || '',
        testTypeMap[attempt.testInfo?.test_type] || attempt.testInfo?.test_type || '',
        attempt.attemptNumber || '',
        attempt.startedAt ? new Date(attempt.startedAt).toLocaleString() : '',
        attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : '',
        attempt.result?.totalQuestions ?? '',
        attempt.result?.attempted ?? '',
        attempt.result?.correct ?? '',
        attempt.result?.wrong ?? '',
        attempt.result?.skipped ?? '',
        attempt.result?.score ?? '',
        attempt.result?.percentage != null ? `${attempt.result.percentage}%` : '',
        attempt.result?.accuracy != null ? `${attempt.result.accuracy}%` : '',
        attempt.result?.timeSpent ?? '',
        attempt.result?.rank ?? '',
        attempt.result?.totalParticipants ?? '',
        attempt.result?.percentile ?? ''
      ]);

      const filenamePrefix = `user_${userId}_test_${testId}_attempts`;

      if (format === 'csv') {
        const csvString = exportToCsvString(headers, rows);
        const buffer = Buffer.from(csvString, 'utf-8');
        res.set({
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenamePrefix}_export.csv"`,
          'Content-Length': buffer.length,
        });
        return res.end(buffer);
      } else {
        const buffer = exportToExcelBuffer(headers, rows, 'User Attempts');
        res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filenamePrefix}_export.xlsx"`,
          'Content-Length': buffer.length,
        });
        return res.end(buffer);
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }
}
