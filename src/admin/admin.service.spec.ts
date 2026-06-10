import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from 'src/auth/auth.service';

const mockAdminModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
};

const mockSuperAdminModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
};

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken('Admin'),
          useValue: mockAdminModel,
        },
        {
          provide: getModelToken('SuperAdmin'),
          useValue: mockSuperAdminModel,
        },
        {
          provide: AuthService,
          useValue: {
            hashPassword: jest.fn(),
            comparePassword: jest.fn(),
            createToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
