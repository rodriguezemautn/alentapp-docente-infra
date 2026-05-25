import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisciplineValidator } from './DisciplineValidator.js';
import { SportRepository } from '../SportRepository.js';

describe('DisciplineValidator', () => {
  const mockSportRepo = {
    findById: vi.fn(),
  } as unknown as SportRepository;

  const validator = new DisciplineValidator(mockSportRepo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateEndDate', () => {
    it('debe pasar si endDate es posterior a startDate', () => {
      expect(() => validator.validateEndDate('2026-06-15', '2026-06-01')).not.toThrow();
    });

    it('debe lanzar error si endDate es igual a startDate', () => {
      expect(() => validator.validateEndDate('2026-06-01', '2026-06-01')).toThrow(
        'La fecha de fin debe ser posterior a la fecha de inicio'
      );
    });

    it('debe lanzar error si endDate es anterior a startDate', () => {
      expect(() => validator.validateEndDate('2026-05-01', '2026-06-01')).toThrow(
        'La fecha de fin debe ser posterior a la fecha de inicio'
      );
    });
  });

  describe('validateSportExists', () => {
    it('debe pasar si el deporte existe', async () => {
      vi.mocked(mockSportRepo.findById).mockResolvedValueOnce({
        id: 'sport-1',
        name: 'Fútbol',
        description: 'Deporte de equipo',
        maxCapacity: 22,
        created_at: '2026-01-01T00:00:00.000Z',
      });

      await expect(validator.validateSportExists('sport-1')).resolves.not.toThrow();
      expect(mockSportRepo.findById).toHaveBeenCalledWith('sport-1');
    });

    it('debe lanzar error si el deporte no existe', async () => {
      vi.mocked(mockSportRepo.findById).mockResolvedValueOnce(null);

      await expect(validator.validateSportExists('sport-no-existe')).rejects.toThrow(
        'El deporte no existe'
      );
      expect(mockSportRepo.findById).toHaveBeenCalledWith('sport-no-existe');
    });
  });
});
