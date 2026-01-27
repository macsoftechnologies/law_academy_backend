import { Test, TestingModule } from '@nestjs/testing';
import { GuestLecturesService } from './guest_lectures.service';

describe('GuestLecturesService', () => {
  let service: GuestLecturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuestLecturesService],
    }).compile();

    service = module.get<GuestLecturesService>(GuestLecturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
