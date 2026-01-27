import { Test, TestingModule } from '@nestjs/testing';
import { GuestLecturesController } from './guest_lectures.controller';
import { GuestLecturesService } from './guest_lectures.service';

describe('GuestLecturesController', () => {
  let controller: GuestLecturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestLecturesController],
      providers: [GuestLecturesService],
    }).compile();

    controller = module.get<GuestLecturesController>(GuestLecturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
