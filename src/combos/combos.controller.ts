import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CombosService } from './combos.service';
import { comboDto } from './dtos/combo.dto';
import { extname } from 'path';

@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // ADMIN ROUTES
  // ──────────────────────────────────────────────────────────────────────────

  @Post('create')
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
  createCombo(@Body() body: comboDto, @UploadedFile() image) {
    return this.combosService.createCombo(body, image);
  }

  @Get('list')
  getCombos(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const p = Number(page) || 1;
    const l = Number(limit) || 10;
    return this.combosService.getCombos(p, l);
  }

  @Get('details')
  getComboById(@Query() query: comboDto) {
    return this.combosService.getComboById(query);
  }

  @Put('edit')
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
  editCombo(@Body() body: comboDto, @UploadedFile() image) {
    return this.combosService.editCombo(body, image);
  }

  @Delete('delete')
  deleteCombo(@Body() body: comboDto) {
    return this.combosService.deleteCombo(body);
  }

  @Post('preview')
  previewComboContent(@Body() body: comboDto) {
    return this.combosService.previewComboContent(body);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // USER ROUTES
  // ──────────────────────────────────────────────────────────────────────────

  @Get('user/list')
  getCombosForUser(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('userId') userId: string,
  ) {
    const p = Number(page) || 1;
    const l = Number(limit) || 10;
    return this.combosService.getCombosForUser(p, l, userId);
  }

  @Get('user/content')
  getComboContent(
    @Query('combo_id') comboId: string,
    @Query('userId') userId: string,
  ) {
    return this.combosService.getComboContent(comboId, userId);
  }

  @Get('user/lectures-by-subject')
  getComboLecturesBySubject(
    @Query('combo_id') comboId: string,
    @Query('subjectId') subjectId: string,
    @Query('userId') userId: string,
  ) {
    return this.combosService.getComboLecturesBySubject(comboId, subjectId, userId);
  }
}
