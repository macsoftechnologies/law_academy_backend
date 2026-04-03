import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { TestTermsService } from './test_terms.service';
import { testTermsDto } from './dto/test_terms.dto';

@Controller('test-terms')
export class TestTermsController {
  constructor(private readonly testTermsService: TestTermsService) {}

  @Post('/add')
  async addTestTerms(@Body() req: testTermsDto) {
    try {
      const addTerms = await this.testTermsService.createTerm(req);
      return addTerms;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Get('/')
  async getTestTerms(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const terms = await this.testTermsService.getTerms(
        Number(page),
        Number(limit),
      );
      return terms;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('/by_type')
  async getTermsByType(@Body() req: testTermsDto) {
    try {
      const getterm = await this.testTermsService.getbyType(req);
      return getterm;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('/update')
  async editTerms(@Body() req: testTermsDto) {
    try {
      const edit = await this.testTermsService.updateTerms(req);
      return edit;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('/delete')
  async removeTerm(@Body() req: testTermsDto) {
    try {
      const removeterm = await this.testTermsService.deleteTerm(req);
      return removeterm;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }
}
