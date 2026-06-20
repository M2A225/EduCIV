import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { PrismaService } from '../core/prisma.service';
import { mockPrismaService } from '../../test/prisma-mock';

describe('CitiesService', () => {
  let service: CitiesService;
  const prisma = mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CitiesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all cities with communes', async () => {
      const cities = [{ id: 1, name: 'Douala', communes: [] }];
      prisma.city.findMany.mockResolvedValue(cities);

      const result = await service.findAll();

      expect(prisma.city.findMany).toHaveBeenCalledWith({
        include: {
          communes: {
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(cities);
    });
  });

  describe('getById', () => {
    it('should return a city by id', async () => {
      const city = { id: 1, name: 'Douala', communes: [] };
      prisma.city.findUnique.mockResolvedValue(city);

      const result = await service.getById(1);

      expect(result).toEqual(city);
    });

    it('should throw NotFoundException if city not found', async () => {
      prisma.city.findUnique.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a city', async () => {
      prisma.city.findUnique.mockResolvedValue(null);
      const created = { id: 1, name: 'Douala' };
      prisma.city.create.mockResolvedValue(created);

      const result = await service.create('Douala');

      expect(prisma.city.create).toHaveBeenCalledWith({
        data: { name: 'Douala' },
      });
      expect(result).toEqual(created);
    });

    it('should throw ConflictException if city already exists', async () => {
      prisma.city.findUnique.mockResolvedValue({ id: 1, name: 'Douala' });

      await expect(service.create('Douala')).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a city', async () => {
      prisma.city.findUnique.mockResolvedValue({
        id: 1,
        name: 'Douala',
        communes: [],
      });
      const updated = { id: 1, name: 'Douala Nouveau' };
      prisma.city.update.mockResolvedValue(updated);

      const result = await service.update(1, 'Douala Nouveau');

      expect(prisma.city.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Douala Nouveau' },
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if city not found', async () => {
      prisma.city.findUnique.mockResolvedValue(null);

      await expect(service.update(999, 'Test')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a city', async () => {
      prisma.city.findUnique.mockResolvedValue({
        id: 1,
        name: 'Douala',
        communes: [],
      });
      prisma.city.delete.mockResolvedValue({ id: 1, name: 'Douala' });

      const result = await service.delete(1);

      expect(prisma.city.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if city not found', async () => {
      prisma.city.findUnique.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCommunes', () => {
    it('should return communes for a city', async () => {
      prisma.city.findUnique.mockResolvedValue({
        id: 1,
        name: 'Douala',
        communes: [],
      });
      const communes = [{ id: 1, name: 'Bonapriso' }];
      prisma.commune.findMany.mockResolvedValue(communes);

      const result = await service.getCommunes(1);

      expect(prisma.commune.findMany).toHaveBeenCalledWith({
        where: { city_id: 1 },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(communes);
    });

    it('should throw NotFoundException if city not found', async () => {
      prisma.city.findUnique.mockResolvedValue(null);

      await expect(service.getCommunes(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCommune', () => {
    it('should create a commune for a city', async () => {
      prisma.city.findUnique.mockResolvedValue({
        id: 1,
        name: 'Douala',
        communes: [],
      });
      const created = { id: 1, name: 'Bonapriso', city_id: 1 };
      prisma.commune.create.mockResolvedValue(created);

      const result = await service.createCommune(1, 'Bonapriso');

      expect(prisma.commune.create).toHaveBeenCalledWith({
        data: { name: 'Bonapriso', city_id: 1 },
      });
      expect(result).toEqual(created);
    });

    it('should throw NotFoundException if city not found', async () => {
      prisma.city.findUnique.mockResolvedValue(null);

      await expect(service.createCommune(999, 'Test')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCommune', () => {
    it('should update a commune', async () => {
      prisma.commune.findUnique.mockResolvedValue({
        id: 1,
        name: 'Bonapriso',
        city_id: 1,
      });
      const updated = { id: 1, name: 'Bonapriso Nouveau', city_id: 1 };
      prisma.commune.update.mockResolvedValue(updated);

      const result = await service.updateCommune(1, 'Bonapriso Nouveau');

      expect(prisma.commune.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Bonapriso Nouveau' },
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if commune not found', async () => {
      prisma.commune.findUnique.mockResolvedValue(null);

      await expect(service.updateCommune(999, 'Test')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteCommune', () => {
    it('should delete a commune', async () => {
      prisma.commune.findUnique.mockResolvedValue({
        id: 1,
        name: 'Bonapriso',
        city_id: 1,
      });
      prisma.commune.delete.mockResolvedValue({
        id: 1,
        name: 'Bonapriso',
        city_id: 1,
      });

      const result = await service.deleteCommune(1);

      expect(prisma.commune.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if commune not found', async () => {
      prisma.commune.findUnique.mockResolvedValue(null);

      await expect(service.deleteCommune(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
