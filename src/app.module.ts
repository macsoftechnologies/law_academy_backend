import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesGuard } from './auth/guards/roles.guard';

import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { BannersModule } from './banners/banners.module';
import { CategoriesModule } from './categories/categories.module';
import { PlansModule } from './plans/plans.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { GuestLecturesModule } from './guest_lectures/guest_lectures.module';
import { LawsModule } from './laws/laws.module';
import { SubjectsModule } from './subjects/subjects.module';
import { LecturesModule } from './lectures/lectures.module';
import { CouponsModule } from './coupons/coupons.module';
import { NotesModule } from './notes/notes.module';
import { SubjectNotesModule } from './subject_notes/subject_notes.module';

@Module({
  imports: [
    // ✅ LOAD CONFIG FIRST
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // ✅ THEN use ConfigService
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
      }),
    }),

    AuthModule,
    AdminModule,
    UsersModule,
    BannersModule,
    CategoriesModule,
    PlansModule,
    EnrollmentsModule,
    GuestLecturesModule,
    LawsModule,
    SubjectsModule,
    LecturesModule,
    CouponsModule,
    NotesModule,
    SubjectNotesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
