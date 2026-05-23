import { describe, it, expect } from 'vitest';
import { PaymentValidator } from './PaymentValidator.js';
import { ValidationError, NotFoundError, ConflictError } from '../errors.js';
import { PaymentDetailDTO } from '@alentapp/shared';

describe('PaymentValidator', () => {
    const validator = new PaymentValidator();

    describe('validateAmount', () => {
        it('debe pasar si el monto es positivo', () => {
            expect(() => validator.validateAmount(150.0)).not.toThrow();
            expect(() => validator.validateAmount(0.01)).not.toThrow();
            expect(() => validator.validateAmount(1000)).not.toThrow();
        });

        it('debe lanzar ValidationError si el monto es 0', () => {
            expect(() => validator.validateAmount(0)).toThrow(ValidationError);
        });

        it('debe lanzar ValidationError si el monto es negativo', () => {
            expect(() => validator.validateAmount(-10)).toThrow(ValidationError);
        });

        it('debe lanzar ValidationError si el monto es undefined', () => {
            expect(() => validator.validateAmount(undefined as unknown as number)).toThrow(ValidationError);
        });

        it('debe lanzar ValidationError si el monto es null', () => {
            expect(() => validator.validateAmount(null as unknown as number)).toThrow(ValidationError);
        });
    });

    describe('validatePaymentType', () => {
        it('debe pasar si el tipo de pago es válido', () => {
            expect(() => validator.validatePaymentType('Cuota')).not.toThrow();
            expect(() => validator.validatePaymentType('Mensualidad')).not.toThrow();
            expect(() => validator.validatePaymentType('Inscripcion')).not.toThrow();
            expect(() => validator.validatePaymentType('Otro')).not.toThrow();
        });

        it('debe lanzar ValidationError si el tipo de pago es inválido', () => {
            expect(() => validator.validatePaymentType('Invalido')).toThrow(ValidationError);
            expect(() => validator.validatePaymentType('')).toThrow(ValidationError);
        });
    });

    describe('validateCancel', () => {
        it('debe pasar si el pago existe y no está cancelado', () => {
            const payment = { status: 'Completed' } as PaymentDetailDTO;
            expect(() => validator.validateCancel(payment)).not.toThrow();
        });

        it('debe lanzar NotFoundError si el pago es null', () => {
            expect(() => validator.validateCancel(null)).toThrow(NotFoundError);
        });

        it('debe lanzar ConflictError si el pago ya está cancelado', () => {
            const payment = { status: 'Canceled' } as PaymentDetailDTO;
            expect(() => validator.validateCancel(payment)).toThrow(ConflictError);
        });
    });

    describe('validateDateRange', () => {
        it('debe pasar si from es anterior a to', () => {
            expect(() => validator.validateDateRange('2026-01-01', '2026-12-31')).not.toThrow();
        });

        it('debe pasar si from y to son iguales', () => {
            expect(() => validator.validateDateRange('2026-01-01', '2026-01-01')).not.toThrow();
        });

        it('debe pasar si from y to son undefined', () => {
            expect(() => validator.validateDateRange(undefined, undefined)).not.toThrow();
        });

        it('debe pasar si solo from es undefined', () => {
            expect(() => validator.validateDateRange(undefined, '2026-12-31')).not.toThrow();
        });

        it('debe pasar si solo to es undefined', () => {
            expect(() => validator.validateDateRange('2026-01-01', undefined)).not.toThrow();
        });

        it('debe lanzar ValidationError si from es posterior a to', () => {
            expect(() => validator.validateDateRange('2026-12-31', '2026-01-01')).toThrow(ValidationError);
        });
    });
});
