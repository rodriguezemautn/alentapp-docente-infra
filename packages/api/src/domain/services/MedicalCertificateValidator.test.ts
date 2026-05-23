import { describe, it, expect } from 'vitest';
import { MedicalCertificateValidator } from './MedicalCertificateValidator.js';
import { ValidationError } from '../errors.js';

describe('MedicalCertificateValidator', () => {
    const validator = new MedicalCertificateValidator();

    describe('validateExpirationDate', () => {
        it('debe pasar si expirationDate es posterior a issueDate', () => {
            expect(() => validator.validateExpirationDate('2026-01-01', '2026-06-01')).not.toThrow();
        });

        it('debe pasar si expirationDate es igual a issueDate', () => {
            expect(() => validator.validateExpirationDate('2026-01-01', '2026-01-01')).not.toThrow();
        });

        it('debe pasar si expirationDate no se provee', () => {
            expect(() => validator.validateExpirationDate('2026-01-01', undefined)).not.toThrow();
        });

        it('debe lanzar ValidationError si expirationDate es anterior a issueDate', () => {
            expect(() => validator.validateExpirationDate('2026-06-01', '2026-01-01')).toThrow(ValidationError);
        });
    });
});
