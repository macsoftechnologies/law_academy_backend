import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Admin } from '../../admin/schema/admin.schema';
import { SuperAdmin } from '../../admin/schema/superadmin.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { // 👈 'jwt' name is CRITICAL
  constructor(
    configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(SuperAdmin.name) private readonly superAdminModel: Model<SuperAdmin>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // 👈 MUST match your JwtModule secret
    });
    console.log('✅ JwtStrategy initialized');
  }

  async validate(payload: any) {
    const rawUser = payload?.user?.findAdmin || payload?.user?.findUser;
    if (!rawUser) {
      return payload;
    }

    const userId = rawUser.adminId || rawUser.superadmin_id || rawUser.userId;
    const tokenSessionId = payload?.sessionId;

    if (!tokenSessionId) {
      throw new UnauthorizedException('Session identifier is missing from token.');
    }

    let dbUser: any = null;
    if (rawUser.userId) {
      dbUser = await this.userModel.findOne({ userId });
    } else if (rawUser.adminId) {
      dbUser = await this.adminModel.findOne({ adminId: rawUser.adminId });
    } else if (rawUser.superadmin_id) {
      dbUser = await this.superAdminModel.findOne({ superadmin_id: rawUser.superadmin_id });
    }

    if (!dbUser) {
      throw new UnauthorizedException('User not found.');
    }

    if (dbUser.activeTokenSessionId !== tokenSessionId) {
      throw new UnauthorizedException('Multiple login detected. This session has been terminated.');
    }

    return {
      ...rawUser,
      id: userId,
    };
  }
}
