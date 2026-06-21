import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { AttendanceSessionRepository } from './attendance-session.repository';
import { AttendanceRepository } from './attendance.repository';
import { TimetablesRepository } from '../timetables/timetables.repository';
import { PrismaService } from '../core/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockSessionRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
};

const mockAttendanceRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  find: jest.fn(),
};

const mockTimetableRepo = {
  findOne: jest.fn(),
};

const mockPrisma = {
  attendance: {
    updateMany: jest.fn(),
  },
};

describe('AttendanceService', () => {
  let service: AttendanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: AttendanceSessionRepository, useValue: mockSessionRepo },
        { provide: AttendanceRepository, useValue: mockAttendanceRepo },
        { provide: TimetablesRepository, useValue: mockTimetableRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    const dto = {
      class_id: 1,
      subject_id: 2,
      timetable_id: 3,
      date: '2025-09-01',
      school_id: 1,
    };

    it('should throw if timetable not found', async () => {
      mockTimetableRepo.findOne.mockResolvedValue(null);
      await expect(service.createSession(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return existing session if already created', async () => {
      mockTimetableRepo.findOne.mockResolvedValue({ id: 3, teacher_id: 10 });
      mockSessionRepo.findOne.mockResolvedValue({ id: 5, ...dto });
      const result = (await service.createSession(dto)) as Record<
        string,
        unknown
      >;
      expect(result).toEqual({ id: 5, ...dto });
      expect(mockSessionRepo.create).not.toHaveBeenCalled();
    });

    it('should create and return a new session', async () => {
      mockTimetableRepo.findOne.mockResolvedValue({ id: 3, teacher_id: 10 });
      mockSessionRepo.findOne.mockResolvedValue(null);
      mockSessionRepo.create.mockResolvedValue({
        id: 5,
        ...dto,
        teacher_id: 10,
      });
      const result = (await service.createSession(dto)) as Record<
        string,
        unknown
      >;
      expect(mockSessionRepo.create).toHaveBeenCalledWith({
        ...dto,
        teacher_id: 10,
      });
      expect(result.id).toBe(5);
    });
  });

  describe('markAttendance', () => {
    const sessionId = 1;
    const dto = { student_id: 10, status: 'PRESENT' as const };

    it('should throw if session not found', async () => {
      mockSessionRepo.findOne.mockResolvedValue(null);
      await expect(service.markAttendance(sessionId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create new attendance if none exists', async () => {
      mockSessionRepo.findOne.mockResolvedValue({ id: 1 });
      mockAttendanceRepo.findOne.mockResolvedValue(null);
      mockAttendanceRepo.create.mockResolvedValue({
        id: 1,
        session_id: 1,
        student_id: 10,
        status: 'PRESENT',
        version: 1,
      });

      const result = (await service.markAttendance(sessionId, dto)) as Record<
        string,
        unknown
      > | null;
      expect(mockAttendanceRepo.create).toHaveBeenCalledWith({
        student_id: 10,
        status: 'PRESENT',
        session_id: 1,
        version: 1,
      });
      expect(result!.status).toBe('PRESENT');
    });

    it('should update existing attendance with optimistic locking', async () => {
      const existing = {
        id: 5,
        session_id: 1,
        student_id: 10,
        status: 'ABSENT',
        version: 1,
      };
      mockSessionRepo.findOne.mockResolvedValue({ id: 1 });
      mockAttendanceRepo.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce({ ...existing, status: 'PRESENT', version: 2 });
      mockPrisma.attendance.updateMany.mockResolvedValue({ count: 1 });

      const result = (await service.markAttendance(sessionId, dto)) as Record<
        string,
        unknown
      > | null;
      expect(mockPrisma.attendance.updateMany).toHaveBeenCalledWith({
        where: { id: 5, version: 1 },
        data: { status: 'PRESENT', version: 2 },
      });
      expect((result as Record<string, unknown>).status).toBe('PRESENT');
    });

    it('should throw ConflictException on version mismatch', async () => {
      const existing = {
        id: 5,
        session_id: 1,
        student_id: 10,
        status: 'ABSENT',
        version: 1,
      };
      mockSessionRepo.findOne.mockResolvedValue({ id: 1 });
      mockAttendanceRepo.findOne.mockResolvedValue(existing);
      mockPrisma.attendance.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.markAttendance(sessionId, dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getSession', () => {
    it('should return session by id', async () => {
      mockSessionRepo.findOne.mockResolvedValue({ id: 1, class_id: 1 });
      const result = (await service.getSession(1)) as Record<string, unknown>;
      expect(result).toEqual({ id: 1, class_id: 1 });
    });
  });

  describe('getAttendancesForSession', () => {
    it('should return attendances', async () => {
      mockAttendanceRepo.find.mockResolvedValue([{ id: 1, status: 'PRESENT' }]);
      const result = (await service.getAttendancesForSession(1)) as Array<
        Record<string, unknown>
      >;
      expect(mockAttendanceRepo.find).toHaveBeenCalledWith({
        where: { session_id: 1 },
      });
      expect(result).toHaveLength(1);
    });
  });
});
