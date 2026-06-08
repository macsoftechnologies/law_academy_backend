import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { enrollmentDto } from './dto/enrollment.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('/enroll')
  async addEnroll(@Body() req: enrollmentDto) {
    try {
      const addenroll = await this.enrollmentsService.addEnrollment(req);
      return addenroll;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/user_courses')
  async userCourses(@Body() req: enrollmentDto) {
    try{
      const courses = await this.enrollmentsService.userEnrollments(req);
      return courses
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/details')
  async enrollmentDetails(@Body() req: enrollmentDto) {
    try{
      const details = await this.enrollmentsService.userEnrollmentDetails(req);
      return details
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message
      }
    }
  }

  @Post('/calculate-price')
  async calculatePrice(@Body() req: CalculatePriceDto) {
    try {
      const result = await this.enrollmentsService.calculateEnrollmentPrice(req);
      return result;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }
}
