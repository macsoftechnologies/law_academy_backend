import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { PlansService } from './plans.service';
import { plansDto } from './dto/plans.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post('/add')
  async addPlan(@Body() req: plansDto) {
    try {
      const add = await this.plansService.addCoursePlan(req);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Get('/')
  async getplanslist(@Query('page') page = 10, @Query('limit') limit = 10) {
    try{
      const getlist = await this.plansService.getPlans(
        Number(page),
        Number(limit)
      );
      return getlist
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/bycourse')
  async getplansbycourse(@Body() req: plansDto) {
    try{
      const getlist = await this.plansService.getPlansByCourse(req);
      return getlist
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getbyid')
  async getPlanDetails(@Body() req: plansDto) {
    try {
      const add = await this.plansService.getPlanById(req);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/update')
  async updatePlan(@Body() req: plansDto) {
    try {
      const add = await this.plansService.editPlan(req);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/delete')
  async removePlan(@Body() req: plansDto) {
    try {
      const add = await this.plansService.deletePlan(req);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
