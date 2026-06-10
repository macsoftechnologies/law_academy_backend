import { Test, TestingModule } from '@nestjs/testing';
import { BillingsService } from './billing.service';
import { getModelToken } from '@nestjs/mongoose';

const mockBillingModel = {};
const mockEnrollmentModel = {};

describe('BillingsService', () => {
  let service: BillingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingsService,
        {
          provide: getModelToken('Billing'),
          useValue: mockBillingModel,
        },
        {
          provide: getModelToken('Enrollment'),
          useValue: mockEnrollmentModel,
        },
      ],
    }).compile();

    service = module.get<BillingsService>(BillingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
