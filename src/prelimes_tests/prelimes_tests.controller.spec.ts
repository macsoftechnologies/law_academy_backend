import { Test, TestingModule } from '@nestjs/testing';
import { PrelimesTestsController } from './prelimes_tests.controller';
import { PrelimesTestsService } from './prelimes_tests.service';

describe('PrelimesTestsController', () => {
  let controller: PrelimesTestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrelimesTestsController],
      providers: [PrelimesTestsService],
    }).compile();

    controller = module.get<PrelimesTestsController>(PrelimesTestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
