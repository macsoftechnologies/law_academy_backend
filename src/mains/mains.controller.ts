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
} from '@nestjs/common';
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
