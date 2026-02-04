import { Test, TestingModule } from '@nestjs/testing';
import { SubjectNotesService } from './subject_notes.service';

describe('SubjectNotesService', () => {
  let service: SubjectNotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubjectNotesService],
    }).compile();

    service = module.get<SubjectNotesService>(SubjectNotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
