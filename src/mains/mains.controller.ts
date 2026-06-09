import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { exportToCsvString, exportToExcelBuffer } from 'src/utils/export.util';
import { MainsService } from './mains.service';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mainsDto } from './dto/mains.dto';
import { mainsTestDto } from './dto/mains-test.dto';
import { mainsSubjectTestDto } from './dto/mains-subject-test.dto';
import { mainsAttemptDto } from './dto/mains_attempts.dto';
import { mainsTestResultsDto } from './dto/mains-test-results.dto';

@Controller('mains')
export class MainsController {
  constructor(private readonly mainsService: MainsService) {}

  @Post('/add')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: {
        fileSize: 4 * 1024 * 1024,
      },
      storage: diskStorage({
        destination: './files',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async createMains(@Body() req: mainsDto, @UploadedFiles() image) {
    try {
      const add = await this.mainsService.addMains(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get('/')
  async getMains(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('userId') userId: string,
  ) {
    try {
      const getlist = await this.mainsService.getMainsList(
        Number(page),
        Number(limit),
        String(userId),
      );
      return getlist;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/details')
  async getMainDetails(@Body() req: mainsDto) {
    try {
      const details = await this.mainsService.getMainsById(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/update')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: {
        fileSize: 4 * 1024 * 1024,
      },
      storage: diskStorage({
        destination: './files',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async updateMains(@Body() req: mainsDto, @UploadedFiles() image) {
    try {
      const add = await this.mainsService.editMains(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/delete')
  async removeMains(@Body() req: mainsDto) {
    try {
      const remove = await this.mainsService.deleteMains(req);
      return remove;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // mains Test apis from here

  @Post('/addmainstest')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: {
        fileSize: 4 * 1024 * 1024,
      },
      storage: diskStorage({
        destination: './files',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async createMainsTest(@Body() req: mainsTestDto, @UploadedFiles() image) {
    try {
      const add = await this.mainsService.addMainsTest(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get('/mainstests')
  async getMainsTests(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('mains_id') mains_id: string,
  ) {
    try {
      const getlist = await this.mainsService.getMainsTestsList(
        Number(page),
        Number(limit),
        String(mains_id),
      );
      return getlist;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/mainstestdetails')
  async getMainsTestDetails(@Body() req: mainsTestDto) {
    try {
      const details = await this.mainsService.getMainsTestById(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/updatemainstest')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: {
        fileSize: 4 * 1024 * 1024,
      },
      storage: diskStorage({
        destination: './files',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async updateMainsTest(@Body() req: mainsTestDto, @UploadedFiles() image) {
    try {
      const add = await this.mainsService.editMainsTest(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/deletemainstest')
  async removeMainsTest(@Body() req: mainsTestDto) {
    try {
      const remove = await this.mainsService.deleteMainsTest(req);
      return remove;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // mains subject test apis from here

  @Post('/addmainssubjecttest')
  async createMainsSubjectTest(@Body() req: mainsSubjectTestDto) {
    try {
      const add = await this.mainsService.addMainsSubjectTest(req);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get('/mainssubjecttests')
  async getMainsSubjectTests(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('mains_test_id') mains_test_id: string,
  ) {
    try {
      const getlist = await this.mainsService.getMainsSubjectTestsList(
        Number(page),
        Number(limit),
        String(mains_test_id),
      );
      return getlist;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/mainssubjecttestdetails')
  async getMainsSubjectTestDetails(@Body() req: mainsSubjectTestDto) {
    try {
      const details = await this.mainsService.getMainsSubjectById(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/updatemainssubjecttest')
  async updateMainsSubjectTest(@Body() req: mainsSubjectTestDto) {
    try {
      const add = await this.mainsService.editMainsSubjectTest(req);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/deletemainssubjecttest')
  async removeMainsSubjectTest(@Body() req: mainsSubjectTestDto) {
    try {
      const remove = await this.mainsService.deleteMainsSubjectTest(req);
      return remove;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // mains attempts from here
  @Post('addattempt')
  @UseInterceptors(
    FileInterceptor('answer_script_file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async addAttempt(
    @Body() body: mainsAttemptDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.mainsService.addAttempt(body, file);
  }

  @Get('/mains_attempts')
  async mainsAttemptsList(
    @Query('page') page = 10,
    @Query('limit') limit = 10,
  ) {
    try {
      const getlist = await this.mainsService.getAttempts(
        Number(page),
        Number(limit),
      );
      return getlist;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Get('/mains_attempts/export')
  async exportMainsAttempts(
    @Res() res: Response,
    @Query('format') format = 'excel',
  ) {
    try {
      const attempts = await this.mainsService.getAttemptsForExport();

      const headers = [
        'Attempt ID',
        'Student ID',
        'Student Name',
        'Student Email',
        'Student Mobile Number',
        'Mains Test Title',
        'Subject Test Title',
        'Attempt Number',
        'Attempt Date',
        'Attempt Time',
        'Answer Script URL',
        'Status',
        'Marks Scored',
        'Overall Percentage',
        'Feedback'
      ];

      const rows = attempts.map(attempt => [
        attempt.mains_attempt_id || '',
        attempt.user?.userId || '',
        attempt.user?.name || '',
        attempt.user?.email || '',
        attempt.user?.mobile_number || '',
        attempt.mainsTest?.title || '',
        attempt.subject?.title || '',
        attempt.attempt_no || '',
        attempt.date || '',
        attempt.time || '',
        attempt.answer_script_file || '',
        attempt.status || '',
        attempt.result?.marks_scored ?? '',
        attempt.result?.overall_percentage != null ? `${attempt.result.overall_percentage}%` : '',
        attempt.result?.feedback || ''
      ]);

      if (format === 'csv') {
        const csvString = exportToCsvString(headers, rows);
        const buffer = Buffer.from(csvString, 'utf-8');
        res.set({
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="mains_attempts_export.csv"',
          'Content-Length': buffer.length,
        });
        return res.end(buffer);
      } else {
        const buffer = exportToExcelBuffer(headers, rows, 'Mains Attempts');
        res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="mains_attempts_export.xlsx"',
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

  @Post('/mainstestattempts')
  async mainsTestAttempts(@Body() body: { mains_test_id: string; userId: string },) {
    try {
      const { mains_test_id, userId } = body;
      const list = await this.mainsService.getMainsTestWithAttempts(
        mains_test_id,
        userId,
      );
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Get('/mainstestattempts/export')
  async exportMainsTestAttempts(
    @Res() res: Response,
    @Query('mains_test_id') mains_test_id: string,
    @Query('userId') userId: string,
    @Query('format') format = 'excel',
  ) {
    if (!mains_test_id || !userId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'mains_test_id and userId query parameters are required',
      });
    }

    try {
      const attempts = await this.mainsService.getMainsTestAttemptsForExport(mains_test_id, userId);

      const headers = [
        'Attempt ID',
        'Student ID',
        'Student Name',
        'Student Email',
        'Student Mobile Number',
        'Mains Test Title',
        'Subject Test Title',
        'Attempt Number',
        'Attempt Date',
        'Attempt Time',
        'Answer Script URL',
        'Status',
        'Marks Scored',
        'Overall Percentage',
        'Feedback'
      ];

      const rows = attempts.map(attempt => [
        attempt.mains_attempt_id || '',
        attempt.userId || '',
        attempt.user?.name || '',
        attempt.user?.email || '',
        attempt.user?.mobile_number || '',
        attempt.mainsTest?.title || '',
        attempt.subject?.title || '',
        attempt.attempt_no || '',
        attempt.date || '',
        attempt.time || '',
        attempt.answer_script_file || '',
        attempt.status || '',
        attempt.result?.marks_scored ?? '',
        attempt.result?.overall_percentage != null ? `${attempt.result.overall_percentage}%` : '',
        attempt.result?.feedback || ''
      ]);

      const filenamePrefix = `user_${userId}_mains_test_${mains_test_id}_attempts`;

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
        const buffer = exportToExcelBuffer(headers, rows, 'User Mains Attempts');
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

  @Post('/attemptdetails')
  async getAtemptDetails(@Body() req: mainsAttemptDto) {
    try{
      const getDetails = await this.mainsService.getAttemptDetails(req);
      return getDetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      }
    }
  }

  //  Result apis from here
  @Post('/addresult')
  async addResult(@Body() req: mainsTestResultsDto) {
    try{
      const addresult = await this.mainsService.addResult(req);
      return addresult
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      }
    }
  }

  @Post('/resultdetails')
  async getResult(@Body() req: mainsTestResultsDto) {
    try{
      const getdetails = await this.mainsService.getResultDetails(req);
      return getdetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      }
    }
  }
}
