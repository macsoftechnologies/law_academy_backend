import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { adminDto } from './dto/admin.dto';
import { superadminDto } from './dto/superadmin.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';
import { Role } from 'src/auth/guards/roles.enum';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/superadmin')
  async superAdminRegister(@Body() req: superadminDto) {
    try {
      return await this.adminService.createSuperAdmin(req);
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.message || 'Something went wrong',
      };
    }
  }

  @Post('/superadminlogin')
  async loginSuperAdmin(@Body() req: superadminDto) {
    try {
      const loginadmin = await this.adminService.loginSuperAdmin(req);
      return loginadmin;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Post('/register')
  async adminRegister(@Body() req: adminDto) {
    try {
      return await this.adminService.createAdmin(req);
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.message || 'Something went wrong',
      };
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Get('/')
  async getAdminsList() {
    try{
      const getlist = await this.adminService.getAdmins();
      return getlist
    } catch(error){
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error
      }
    }
  }

  @Post('/login')
  async loginAdmin(@Body() req: adminDto) {
    try {
      const loginadmin = await this.adminService.loginAdmin(req);
      return loginadmin;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post('/update')
  async updateAdmin(@Body() req: adminDto) {
    try {
      const updateadmin = await this.adminService.editAdmin(req);
      return updateadmin;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/forgotpassword')
  async adminForgotPassword(@Body() req: adminDto) {
    try {
      const adminpassword = await this.adminService.forgotPassword(req);
      return adminpassword;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Post('/delete')
  async removeAdmin(@Body() req: adminDto) {
    try{
      const removeadmin = await this.adminService.deleteAdmin(req);
      return removeadmin
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}
