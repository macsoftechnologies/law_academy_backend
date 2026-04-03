import { Test, TestingModule } from '@nestjs/testing';
import { TestTermsController } from './test_terms.controller';
import { TestTermsService } from './test_terms.service';

describe('TestTermsController', () => {
  let controller: TestTermsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestTermsController],
      providers: [TestTermsService],
    }).compile();

    controller = module.get<TestTermsController>(TestTermsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
