import { PaymentDetailDTO } from '@alentapp/shared';
import { ValidationError, NotFoundError, ConflictError } from '../errors.js';

const VALID_PAYMENT_TYPES = ['Cuota', 'Mensualidad', 'Inscripcion', 'Otro'] as const;

export class PaymentValidator {
    validateAmount(amount: number): void {
        if (amount === undefined || amount === null) {
            throw new ValidationError('El monto es requerido');
        }
        if (typeof amount !== 'number' || amount <= 0) {
            throw new ValidationError('El monto debe ser un número positivo');
        }
    }

    validatePaymentType(type: string): void {
        if (!type || !(VALID_PAYMENT_TYPES as readonly string[]).includes(type)) {
            throw new ValidationError('El tipo de pago no es válido');
        }
    }

    validateCancel(payment: PaymentDetailDTO | null): void {
        if (!payment) {
            throw new NotFoundError('Pago no encontrado');
        }
        if (payment.status === 'Canceled') {
            throw new ConflictError('El pago ya está cancelado');
        }
    }

    validateDateRange(from?: string, to?: string): void {
        if (from && to && new Date(from) > new Date(to)) {
            throw new ValidationError('La fecha "desde" no puede ser posterior a la fecha "hasta"');
        }
    }
}
