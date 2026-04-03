import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PrelimesService } from './prelimes.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { prelimesDto } from './dto/prelimes.dto';
import { mockTestSubjectDto } from './dto/subject-wise-mock-test.dto';

@Controller('prelimes')
export class PrelimesController {
  constructor(private readonly prelimesService: PrelimesService) {}

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
  async createPrelimes(@Body() req: prelimesDto, @UploadedFiles() image) {
    try {
      const add = await this.prelimesService.addPrelimes(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get('/')
  async getPrelimes(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('userId') userId: string,
  ) {
    try {
      const getlist = await this.prelimesService.getPrelimesList(
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
  async getPrelimeDetails(@Body() req: prelimesDto) {
    try {
      const details = await this.prelimesService.getPrelimesById(req);
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
  async updatePrelimes(@Body() req: prelimesDto, @UploadedFiles() image) {
    try {
      const add = await this.prelimesService.editPrelimes(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/delete')
  async removePrelimes(@Body() req: prelimesDto) {
    try {
      const remove = await this.prelimesService.deletePrelimes(req);
      return remove;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // mock test subjects apis from here

  @Post('/addmocktestsubject')
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
  async createMockTestSubject(
    @Body() req: mockTestSubjectDto,
    @UploadedFiles() image,
  ) {
    try {
      const add = await this.prelimesService.addMockTestSubject(req, image);
      return add;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get('/mocktestsubjects')
  async getMockTestSubjectsList(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      const getlist = await this.prelimesService.getMockTestSubjects(
        Number(page),
        Number(limit),
      );
      return getlist;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/mocktestsubjectdetails')
  async getMockTestSubjectDetails(@Body() req: mockTestSubjectDto) {
    try {
      const details = await this.prelimesService.getMockTestDetails(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('/subjectmocktestbylaw')
  async getMockTestSubjectByLaw(@Body() req: mockTestSubjectDto) {
    try {
      const details = await this.prelimesService.getMockTestBasedOnLaw(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('/update_mock_test')
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
  async updateSubjectMockTest(@Body() req: mockTestSubjectDto, @UploadedFiles() image) {
    try {
      const modify = await this.prelimesService.editMockTest(req, image);
      return modify;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/delete_subject_mock_test')
  async removeSubjectMockTest(@Body() req: mockTestSubjectDto) {
    try {
      const remove = await this.prelimesService.deleteSubjectMockTest(req);
      return remove;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }  
}
