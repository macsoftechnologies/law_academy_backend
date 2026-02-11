import { Test, TestingModule } from '@nestjs/testing';
import { MainsController } from './mains.controller';
import { MainsService } from './mains.service';

describe('MainsController', () => {
  let controller: MainsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MainsController],
      providers: [MainsService],
    }).compile();

    controller = module.get<MainsController>(MainsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
