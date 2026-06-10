import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guards/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from '../users/schemas/user.schema';
import { Admin, adminSchema } from '../admin/schema/admin.schema';
import { SuperAdmin, superadminSchema } from '../admin/schema/superadmin.schema';

@Module({
  imports: [
    ConfigModule, // 👈 makes ConfigService available
    PassportModule.register({ defaultStrategy: 'jwt' }), // 👈 register jwt with passport
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '10s' },
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: userSchema },
      { name: Admin.name, schema: adminSchema },
      { name: SuperAdmin.name, schema: superadminSchema },
    ]),
  ],
  providers: [
    AuthService,
    JwtStrategy, // 👈 this registers the jwt strategy with passport
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [PassportModule, JwtModule], // 👈 export if needed elsewhere
})
export class AuthModule {}

