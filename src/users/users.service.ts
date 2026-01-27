import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { EducationalCertificates } from './schemas/educational_certificates.schema';
import { IdProof } from './schemas/idproofs.schema';
import { registerDto } from './dtos/register.dto';
import { AuthService } from 'src/auth/auth.service';
import { loginDto } from './dtos/login.dto';
import { loginAnotherwayDto } from './dtos/loginInAnotherway.dto';
import { isEmail, isMobileNumber } from './utils/auth.util';
import { generateReferralCode } from './utils/referral-code.util';
import { referralDto } from './dtos/claimReferral.dto';
import { verifyDto } from './dtos/verify.dto';
import { forgotPasswordDto } from './dtos/forgotpassword.dto';
import { personalInformationDto } from './dtos/personal_information.dto';
import { detailsUpdateDto } from './dtos/detailsUpdateRequest.dto';
import { DetailsUpdateRequest } from './schemas/detailsUpdateRequest.schema';
import { DetailsRequestStatus } from 'src/auth/guards/roles.enum';
import { educationalCertificatesDto } from './dtos/educational_certificates.dto';
import { idProofDto } from './dtos/idproofs.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(EducationalCertificates.name)
    private readonly educationalCertificatesModel: Model<EducationalCertificates>,
    @InjectModel(IdProof.name)
    private readonly idProofsModel: Model<IdProof>,
    @InjectModel(DetailsUpdateRequest.name)
    private readonly deatilsRequestModel: Model<DetailsUpdateRequest>,
    private readonly authService: AuthService,
  ) {}

  private async createUniqueReferralCode(): Promise<string> {
    let code: string;
    let exists: boolean;

    do {
      code = generateReferralCode();
      const user = await this.userModel.findOne({ referral_code: code });
      exists = !!user;
    } while (exists);

    return code;
  }

  async registeruser(req: registerDto) {
    try {
      const findUser = await this.userModel.findOne({
        $or: [{ email: req.email }, { mobile_number: req.mobile_number }],
      });
      if (findUser) {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'User already existed',
        };
      }
      const referralCode = await this.createUniqueReferralCode();
      const otp = Math.floor(10000 + Math.random() * 900000);
      const bcryptPassword = await this.authService.hashPassword(req.password);
      const adduser = await this.userModel.create({
        name: req.name,
        email: req.email,
        mobile_number: req.mobile_number,
        password: bcryptPassword,
        otp: otp.toString(),
        referral_code: referralCode,
      });
      if (adduser) {
        return {
          statusCode: HttpStatus.OK,
          message:
            'User Registered Successfully.Please Verify your mobile number or email',
          data: adduser,
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to register please try later',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async loginUser(req: loginDto) {
    try {
      const findUser = await this.userModel.findOne({
        $and: [{ email: req.email }, { mobile_number: req.mobile_number }],
      });
      if (!findUser) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Super Admin Not Found',
        };
      } else {
        const matchPassword = await this.authService.comparePassword(
          req.password,
          findUser.password,
        );
        // console.log(matchPassword);
        if (matchPassword) {
          //   const jwtToken = await this.authService.createToken({ findUser });
          //     console.log(jwtToken);
          //   return {
          //     statusCode: HttpStatus.OK,
          //     message: 'User Login successfully',
          //     token: jwtToken,
          //     data: findUser,
          //   };
          return {
            statusCode: HttpStatus.OK,
            message: 'Login Successful.Please verify your account.',
            data: findUser,
          };
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Password incorrect',
          };
        }
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async loginAnotherway(req: loginAnotherwayDto) {
    try {
      const { text } = req;

      let loginType: 'email' | 'mobile';

      if (isEmail(text)) {
        loginType = 'email';
      } else if (isMobileNumber(text)) {
        loginType = 'mobile';
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Please enter a valid email or mobile number',
        };
      }

      // const otp = Math.floor(100000 + Math.random() * 900000);
      let findUser;
      if (loginType === 'mobile') {
        findUser = await this.userModel.findOne({ mobile_number: text });
        //   await this.smsService.sendOtp(text, otp);
      } else {
        //   await this.mailService.sendOtp(text, otp);
        findUser = await this.userModel.findOne({ email: text });
      }

      return {
        statusCode: HttpStatus.OK,
        message: `OTP sent successfully via ${loginType}`,
        data: findUser,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Something went wrong',
      };
    }
  }

  async claimReferral(req: referralDto) {
    try {
      const findReferral = await this.userModel.findOne({
        referral_code: req.referred_by,
      });
      if (!findReferral) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid Referral code',
        };
      }
      const addReferral = await this.userModel.updateOne(
        { userId: req.userId },
        {
          $set: {
            referred_by: req.referred_by,
          },
        },
      );
      if (addReferral) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Referral claimed successfully',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async verifyOTP(req: verifyDto) {
    try {
      const findUser = await this.userModel.findOne({ userId: req.userId });
      if (findUser && req.otp == '12345') {
        const jwtToken = await this.authService.createToken({ findUser });
        //   console.log(jwtToken);
        return {
          statusCode: HttpStatus.OK,
          message: 'User Verified successfully',
          token: jwtToken,
          data: findUser,
        };
      }
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Invalid OTP',
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async forgotPassword(req: forgotPasswordDto) {
    try {
      const findUser = await this.userModel.findOne({ userId: req.userId });
      if (findUser) {
        const matchPassword = await this.authService.comparePassword(
          req.password,
          findUser.password,
        );
        if (matchPassword) {
          return {
            statusCode: HttpStatus.CONFLICT,
            message: 'Password should not match previous password',
          };
        } else {
          const bcryptPassword = await this.authService.hashPassword(
            req.password,
          );
          const updatepassword = await this.userModel.updateOne(
            { userId: req.userId },
            {
              $set: {
                password: bcryptPassword,
              },
            },
          );
          if (updatepassword) {
            return {
              statusCode: HttpStatus.OK,
              message: 'Password Updated Successfully',
              data: updatepassword,
            };
          } else {
            return {
              statusCode: HttpStatus.EXPECTATION_FAILED,
              message: 'Failed to update password',
            };
          }
        }
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async addPersonalInformation(req: personalInformationDto) {
    try {
      const updateInformation = await this.userModel.updateOne(
        { userId: req.userId },
        {
          $set: {
            date_of_birth: req.date_of_birth,
            gender: req.gender,
            mother_name: req.mother_name,
            father_name: req.father_name,
            corresponding_address: req.corresponding_address,
            permanent_address: req.permanent_address,
          },
        },
      );
      if (updateInformation) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Personal Information added successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to add Personal Information',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async addDetailsRequest(req: detailsUpdateDto) {
    try {
      const addDetails = await this.deatilsRequestModel.create(req);
      if (addDetails) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Raised a request for details update',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to raise a request',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getDetailsRequests(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      // --- 1. Total count ---
      const totalCount = await this.deatilsRequestModel.countDocuments();
      const getlist = await this.deatilsRequestModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'userId',
            as: 'userId',
          },
        },
        { $skip: skip },
        { $limit: limit },
        { $sort: { createdAt: -1 } },
      ]);
      return {
        statusCode: HttpStatus.OK,
        message: 'List of Requests',
        currentPage: page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        data: getlist,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getDetailsRequestById(req: detailsUpdateDto) {
    try {
      const findDetailsRequest = await this.deatilsRequestModel.aggregate([
        {
          $match: { detailsId: req.detailsId },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'userId',
            as: 'userId',
          },
        },
      ]);
      if (findDetailsRequest) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Details of User details update request',
          data: findDetailsRequest,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Request details not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async completeUserRequest(req: detailsUpdateDto) {
    try {
      const findRequest = await this.deatilsRequestModel.findOne({
        detailsId: req.detailsId,
      });
      if (findRequest && findRequest.status == DetailsRequestStatus.PENDING) {
        const updateUserDetails = await this.userModel.updateOne(
          { userId: findRequest.userId },
          {
            $set: {
              name: findRequest.name,
              email: findRequest.email,
              mobile_number: findRequest.mobile_number,
            },
          },
        );
        const updatestatus = await this.deatilsRequestModel.updateOne(
          { detailsId: req.detailsId },
          {
            $set: {
              status: DetailsRequestStatus.COMPLETED,
            },
          },
        );
        if (updateUserDetails && updatestatus) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Request completed',
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Failed to complete request',
          };
        }
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async addEducationCertificate(req: educationalCertificatesDto, image) {
    try {
      if (image) {
        const reqDoc = image.map((doc, index) => {
          let IsPrimary = false;
          if (index == 0) {
            IsPrimary = true;
          }
          const randomNumber = Math.floor(Math.random() * 1000000 + 1);
          return doc.filename;
        });

        req.certificate_file = reqDoc.toString();
      }
      const addCertificate =
        await this.educationalCertificatesModel.create(req);
      if (addCertificate) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Certificate added successfully',
          data: addCertificate,
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to add certificate',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getCertificatesofuser(req: educationalCertificatesDto) {
    try {
      const getlist = await this.educationalCertificatesModel.find({
        userId: req.userId,
      });
      if (getlist.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Certificates of user',
          data: getlist,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Certifiates of user not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async removeCertificate(req: educationalCertificatesDto) {
    try {
      const removecertificate =
        await this.educationalCertificatesModel.deleteOne({
          certificate_id: req.certificate_id,
        });
      if (removecertificate) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Certificate deleted successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'failed to delete',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async addIdProof(req: idProofDto, image) {
    try {
      if (image) {
        const reqDoc = image.map((doc, index) => {
          let IsPrimary = false;
          if (index == 0) {
            IsPrimary = true;
          }
          const randomNumber = Math.floor(Math.random() * 1000000 + 1);
          return doc.filename;
        });

        req.proof_file = reqDoc.toString();
      }
      const addproof = await this.idProofsModel.create(req);
      if (addproof) {
        return {
          statusCode: HttpStatus.OK,
          message: 'IdProof added successfully',
          data: addproof,
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to add Idproof',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getIdProofsofuser(req: idProofDto) {
    try {
      const getlist = await this.idProofsModel.find({
        userId: req.userId,
      });
      if (getlist.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'IdProofs of user',
          data: getlist,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'IdProofs of user not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async removeProof(req: idProofDto) {
    try {
      const removeproof = await this.idProofsModel.deleteOne({
        proof_id: req.proof_id,
      });
      if (removeproof) {
        return {
          statusCode: HttpStatus.OK,
          message: 'IdProof deleted successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'failed to delete',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getStudents(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const [students, totalCount] = await Promise.all([
        this.userModel.aggregate([
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'educationalcertificates',
              localField: 'userId',
              foreignField: 'userId',
              as: 'certificates',
            },
          },
          {
            $lookup: {
              from: 'idproofs',
              localField: 'userId',
              foreignField: 'userId',
              as: 'idProofs',
            },
          },
          {
            $project: {
              password: 0,
              __v: 0,
            },
          },
        ]),

        this.userModel.countDocuments(),
      ]);

      return {
        statusCode: HttpStatus.OK,
        message: 'List of Students',
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
        data: students,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  async getUserById(req: registerDto) {
    try {
      const getdetails = await this.userModel.aggregate([
        { $match: { userId: req.userId } },
        {
          $lookup: {
            from: 'educationalcertificates',
            localField: 'userId',
            foreignField: 'userId',
            as: 'certificates',
          },
        },
        {
          $lookup: {
            from: 'idproofs',
            localField: 'userId',
            foreignField: 'userId',
            as: 'idProofs',
          },
        },
        {
          $project: {
            password: 0,
            __v: 0,
          },
        },
      ]);
      if (getdetails) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Student Details',
          data: getdetails,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
