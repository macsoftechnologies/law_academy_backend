import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { registerDto } from './dtos/register.dto';
import { loginDto } from './dtos/login.dto';
import { loginAnotherwayDto } from './dtos/loginInAnotherway.dto';
import { referralDto } from './dtos/claimReferral.dto';
import { verifyDto } from './dtos/verify.dto';
import { forgotPasswordDto } from './dtos/forgotpassword.dto';
import { personalInformationDto } from './dtos/personal_information.dto';
import { detailsUpdateDto } from './dtos/detailsUpdateRequest.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/guards/roles.decorator';
import { Role } from 'src/auth/guards/roles.enum';
import { educationalCertificatesDto } from './dtos/educational_certificates.dto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { idProofDto } from './dtos/idproofs.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  async registerUser(@Body() req: registerDto) {
    try {
      const registeruser = await this.usersService.registeruser(req);
      return registeruser;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/login')
  async loginUser(@Body() req: loginDto) {
    try {
      const loginuser = await this.usersService.loginUser(req);
      return loginuser;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/loginanotherway')
  async loginUserAnotherway(@Body() req: loginAnotherwayDto) {
    try {
      const loginuser = await this.usersService.loginAnotherway(req);
      return loginuser;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/claimreferral')
  async claimUserReferral(@Body() req: referralDto) {
    try {
      const claim = await this.usersService.claimReferral(req);
      return claim;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/verify')
  async verify(@Body() req: verifyDto) {
    try {
      const checkuser = await this.usersService.verifyOTP(req);
      return checkuser;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/forgotpassword')
  async forgotUserPassword(@Body() req: forgotPasswordDto) {
    try {
      const chagepassword = await this.usersService.forgotPassword(req);
      return chagepassword;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Post('/personal_information')
  async addPersonalData(@Body() req: personalInformationDto) {
    try {
      const add_data = await this.usersService.addPersonalInformation(req);
      return add_data;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Post('/updatedetailsrequest')
  async addDetailsRequest(@Body() req: detailsUpdateDto) {
    try {
      const add_data = await this.usersService.addDetailsRequest(req);
      return add_data;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('/detailsrequestslist')
  async getDetailsRequests(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      const getlist = await this.usersService.getDetailsRequests(+page, +limit);
      return getlist;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('/detailsRequest')
  async getDetailsRequestById(@Body() req: detailsUpdateDto) {
    try {
      const getdetails = await this.usersService.getDetailsRequestById(req);
      return getdetails;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('/completerequest')
  async completeRequest(@Body() req: detailsUpdateDto) {
    try {
      const accept_details = await this.usersService.completeUserRequest(req);
      return accept_details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Post('/addcertificate')
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
  async addCertificate(
    @Body() req: educationalCertificatesDto,
    @UploadedFiles() image,
  ) {
    try {
      const addeducation = await this.usersService.addEducationCertificate(
        req,
        image,
      );
      return addeducation;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/getusercertificates')
  async userCertificates(@Body() req: educationalCertificatesDto) {
    try {
      const user_certificates =
        await this.usersService.getCertificatesofuser(req);
      return user_certificates;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/deletecertificate')
  async removecertificate(@Body() req: educationalCertificatesDto) {
    try {
      const user_certificates = await this.usersService.removeCertificate(req);
      return user_certificates;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Post('/addidproof')
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
  async addIdProof(@Body() req: idProofDto, @UploadedFiles() image) {
    try {
      const addproof = await this.usersService.addIdProof(req, image);
      return addproof;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/getuserIDs')
  async userIdProofs(@Body() req: idProofDto) {
    try {
      const user_idproofs = await this.usersService.getIdProofsofuser(req);
      return user_idproofs;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/deleteidproof')
  async removeproof(@Body() req: idProofDto) {
    try {
      const user_certificates = await this.usersService.removeProof(req);
      return user_certificates;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @UseGuards(JwtGuard)
  @Get('/')
  async getUsers(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const list = await this.usersService.getStudents(
        Number(page),
        Number(limit),
      );
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/details')
  async userDetailsById(@Body() req: registerDto) {
    try {
      const getdetails = await this.usersService.getUserById(req);
      return getdetails;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
