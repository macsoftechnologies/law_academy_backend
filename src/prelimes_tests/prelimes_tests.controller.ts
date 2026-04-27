import { Body, Controller, Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { PrelimesTestsService } from './prelimes_tests.service';
import { prelimesTestDto } from './dto/prelimes_tests.dto';
import { prelimesQuestionDto } from './dto/prelimes_questions.dto';

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

  @Get(':id')
  get(@Param('id') id: string) {
    return this.prelimesTestsService.getAttempt(id);
  }
}
