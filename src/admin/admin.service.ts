import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { adminDto } from './dto/admin.dto';
import { Admin } from './schema/admin.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AuthService } from 'src/auth/auth.service';
import { superadminDto } from './dto/superadmin.dto';
import { SuperAdmin } from './schema/superadmin.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(SuperAdmin.name)
    private readonly superAdminModel: Model<SuperAdmin>,
    private readonly authService: AuthService,
  ) {}

  async createSuperAdmin(req: superadminDto) {
    try {
      const findAdmin = await this.superAdminModel.findOne({
        $or: [{ email: req.email }, { mobile_number: req.mobile_number }],
      });
      if (!findAdmin) {
        const bcryptPassword = await this.authService.hashPassword(
          req.password,
        );
        const createAdmin = await this.superAdminModel.create({
          mobile_number: req.mobile_number,
          email: req.email,
          password: bcryptPassword,
        });
        if (createAdmin) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Super Admin Registered Successfully',
            data: createAdmin,
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Failed to create admin',
          };
        }
      }

      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Super Admin already existed',
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async loginSuperAdmin(req: superadminDto) {
    try {
      const findAdmin = await this.superAdminModel.findOne({
        $or: [{ email: req.email }, { mobile_number: req.mobile_number }],
      });
      if (!findAdmin) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Super Admin Not Found',
        };
      } else {
        const matchPassword = await this.authService.comparePassword(
          req.password,
          findAdmin.password,
        );
        // console.log(matchPassword);
        if (matchPassword) {
          const jwtToken = await this.authService.createToken({ findAdmin });
          console.log(jwtToken);
          return {
            statusCode: HttpStatus.OK,
            message: 'Super Admin Login successfull',
            token: jwtToken,
            data: findAdmin,
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

  async createAdmin(req: adminDto) {
    try {
      const findAdmin = await this.adminModel.findOne({
        $or: [{ emailId: req.emailId }, { mobileNumber: req.mobileNumber }],
      });
      if (!findAdmin) {
        const bcryptPassword = await this.authService.hashPassword(
          req.password,
        );
        const createAdmin = await this.adminModel.create({
          mobileNumber: req.mobileNumber,
          emailId: req.emailId,
          password: bcryptPassword,
          role: req.role,
          access_modules: req.access_modules,
        });
        if (createAdmin) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Admin Registered Successfully',
            data: createAdmin,
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Failed to create admin',
          };
        }
      }

      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Admin already existed',
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getAdmins(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const [getList, totalCount] = await Promise.all([
        this.adminModel.find().skip(skip).limit(limit),
        this.adminModel.countDocuments(),
      ]);
      return {
        statusCode: HttpStatus.OK,
        message: 'List of Admin Users',
        totalCount: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
        data: getList,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async loginAdmin(req: adminDto) {
    try {
      const findAdmin = await this.adminModel.findOne({
        $or: [{ emailId: req.emailId }, { mobileNumber: req.mobileNumber }],
      });
      if (!findAdmin) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Admin Not Found',
        };
      } else {
        const matchPassword = await this.authService.comparePassword(
          req.password,
          findAdmin.password,
        );
        // console.log(matchPassword);
        if (matchPassword) {
          const jwtToken = await this.authService.createToken({ findAdmin });
          console.log(jwtToken);
          return {
            statusCode: HttpStatus.OK,
            message: 'Admin Login successfull',
            token: jwtToken,
            data: findAdmin,
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

  async editAdmin(req: adminDto) {
    try {
      const editadmin = await this.adminModel.updateOne(
        { adminId: req.adminId },
        {
          $set: {
            access_modules: req.access_modules,
          },
        },
      );
      if (editadmin) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Modules Access updated successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to update modules access',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async forgotPassword(req: adminDto) {
    try {
      const findAdmin = await this.adminModel.findOne({
        $or: [{ emailId: req.emailId }, { mobileNumber: req.mobileNumber }],
      });
      if (findAdmin) {
        const bcryptPassword = await this.authService.hashPassword(
          req.password,
        );
        req.password = bcryptPassword;
        const forgotPassword = await this.adminModel.updateOne(
          { emailId: findAdmin.emailId },
          {
            $set: {
              password: req.password,
            },
          },
        );
        if (forgotPassword) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Password Updated Successfully',
            data: forgotPassword,
          };
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: 'Password updation failed',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Admin not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async deleteAdmin(req: adminDto) {
    try {
      const removeadmin = await this.adminModel.deleteOne({
        adminId: req.adminId,
      });
      if (removeadmin) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Admin Removed Successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.EXPECTATION_FAILED,
          message: 'Failed to delete Admin',
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
