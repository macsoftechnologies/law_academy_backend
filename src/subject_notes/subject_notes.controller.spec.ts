import { Test, TestingModule } from '@nestjs/testing';
import { SubjectNotesController } from './subject_notes.controller';
import { SubjectNotesService } from './subject_notes.service';

describe('SubjectNotesController', () => {
  let controller: SubjectNotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectNotesController],
      providers: [SubjectNotesService],
    }).compile();

    controller = module.get<SubjectNotesController>(SubjectNotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
