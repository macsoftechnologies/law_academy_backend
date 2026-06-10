import { Test, TestingModule } from '@nestjs/testing';
import { BillingsController } from './billing.controller';
import { BillingsService } from './billing.service';

const mockBillingsService = {};

describe('BillingsController', () => {
  let controller: BillingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingsController],
      providers: [
        {
          provide: BillingsService,
          useValue: mockBillingsService,
        },
      ],
    }).compile();

    controller = module.get<BillingsController>(BillingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
