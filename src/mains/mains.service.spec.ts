import { Test, TestingModule } from '@nestjs/testing';
import { MainsService } from './mains.service';

describe('MainsService', () => {
  let service: MainsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainsService],
    }).compile();

    service = module.get<MainsService>(MainsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
