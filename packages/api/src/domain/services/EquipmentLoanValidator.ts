import type { MemberDTO } from '@alentapp/shared';

export class EquipmentLoanValidator {
    validateMemberSportCategory(member: MemberDTO): void {
        if (!member.sportCategory) {
            throw new Error('El socio no tiene una categoría deportiva asignada');
        }
        if (member.sportCategory === 'Cadet') {
            throw new Error('Los socios categoría Cadet no pueden solicitar préstamos de equipamiento');
        }
    }

    validateStatusForReturn(status: string): void {
        if (status === 'Returned') {
            throw new Error('El préstamo ya fue devuelto');
        }
        if (status === 'Lost') {
            throw new Error('El préstamo ya fue reportado como perdido');
        }
    }

    validateStatusForDeletion(status: string): void {
        if (status === 'Active') {
            throw new Error('No se puede eliminar un préstamo activo. Regístrelo como devuelto o perdido primero');
        }
    }
}
