import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';

export class LectureConfigDto {

  @IsEnum(['law-based', 'subject-based'])
  access_type: 'law-based' | 'subject-based';
  law_id?: string;
  subject_ids?: string[];

}

export class NotesConfigDto {
  access_type: 'law-based' | 'subject-based';
  law_id?: string;
  subject_ids?: string[];

}

export class comboDto {
  combo_id?: string;
  title?: string;
  description?: string;
  presentation_image?: string;
  categoryId?: string;
  subcategory_id?: string;
  includes_lectures?: boolean;
  includes_notes?: boolean;
  includes_prelimes?: boolean;
  includes_mains?: boolean;
  mains_ids?: string[];
  prelimes_ids?: string[];
  lecture_config?: LectureConfigDto;
  notes_config?: NotesConfigDto;
  isActive?: boolean;

  userId?: string;
  planId?: string;
  payment_id?: string;
  combo_enrollment_id?: string;

}