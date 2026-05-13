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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CombosService } from './combos.service';
import { comboDto } from './dtos/combo.dto';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // ADMIN ROUTES
  // ──────────────────────────────────────────────────────────────────────────

  @Post('create')
  @UseInterceptors(FileInterceptor('presentation_image', { storage }))
  createCombo(@Body() body: comboDto, @UploadedFile() image?) {
    return this.combosService.createCombo(body, image ? [image] : null);
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
  @UseInterceptors(FileInterceptor('presentation_image', { storage }))
  editCombo(@Body() body: comboDto, @UploadedFile() image?) {
    return this.combosService.editCombo(body, image ? [image] : null);
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
