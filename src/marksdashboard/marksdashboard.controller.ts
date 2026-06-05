import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MarksdashboardService } from './marksdashboard.service';
import { getDashboardDto, updateProgressDto, updateGoalDto } from './dto/marksdashboard.dto';

@ApiTags('marksdashboard')
@Controller('marksdashboard')
export class MarksdashboardController {
  constructor(private readonly marksdashboardService: MarksdashboardService) {}

  @Post('/stats')
  async getStats(@Body() req: getDashboardDto) {
    try {
      const result = await this.marksdashboardService.getDashboardStats(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  @Post('/update-progress')
  async updateProgress(@Body() req: updateProgressDto) {
    try {
      const result = await this.marksdashboardService.updateProgress(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  @Post('/update-goal')
  async updateGoal(@Body() req: updateGoalDto) {
    try {
      const result = await this.marksdashboardService.updateGoal(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }
}
