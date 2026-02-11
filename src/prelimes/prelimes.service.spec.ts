import { Test, TestingModule } from '@nestjs/testing';
import { PrelimesService } from './prelimes.service';

describe('PrelimesService', () => {
  let service: PrelimesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrelimesService],
    }).compile();

    service = module.get<PrelimesService>(PrelimesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
