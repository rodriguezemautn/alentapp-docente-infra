import { ValidationError } from '../errors.js';

export class MedicalCertificateValidator {
    validateExpirationDate(issueDate: string, expirationDate?: string): void {
        if (expirationDate && new Date(expirationDate) < new Date(issueDate)) {
            throw new ValidationError('La fecha de vencimiento no puede ser anterior a la fecha de emisión');
        }
    }
}
