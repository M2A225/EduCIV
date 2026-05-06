import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceSession } from '../entities/attendance_session.entity';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceSessionRepository } from './attendance-session.repository';
import { AttendanceRepository } from './attendance.repository';

describe('AttendanceService', () => {
  let service: AttendanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: AttendanceSessionRepository, useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: AttendanceRepository, useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn(), find: jest.fn() } },
        { provide: DataSource, useValue: { getRepository: jest.fn(() => ({ findOne: jest.fn() })) } },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
