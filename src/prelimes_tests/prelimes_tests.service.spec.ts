import { Test, TestingModule } from '@nestjs/testing';
import { PrelimesTestsService } from './prelimes_tests.service';

describe('PrelimesTestsService', () => {
  let service: PrelimesTestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrelimesTestsService],
    }).compile();

    service = module.get<PrelimesTestsService>(PrelimesTestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
