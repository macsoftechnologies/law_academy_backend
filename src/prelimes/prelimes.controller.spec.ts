import { Test, TestingModule } from '@nestjs/testing';
import { PrelimesController } from './prelimes.controller';
import { PrelimesService } from './prelimes.service';

describe('PrelimesController', () => {
  let controller: PrelimesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrelimesController],
      providers: [PrelimesService],
    }).compile();

    controller = module.get<PrelimesController>(PrelimesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
