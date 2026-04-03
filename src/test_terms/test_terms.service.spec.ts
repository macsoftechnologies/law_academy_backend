import { Test, TestingModule } from '@nestjs/testing';
import { TestTermsService } from './test_terms.service';

describe('TestTermsService', () => {
  let service: TestTermsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestTermsService],
    }).compile();

    service = module.get<TestTermsService>(TestTermsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
