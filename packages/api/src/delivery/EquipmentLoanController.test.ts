import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EquipmentLoanController } from './EquipmentLoanController.js';

describe('EquipmentLoanController', () => {
    const mockCreate = { execute: vi.fn() };
    const mockGetAll = { execute: vi.fn() };
    const mockGetById = { execute: vi.fn() };
    const mockReturn = { execute: vi.fn() };
    const mockReportLost = { execute: vi.fn() };
    const mockDelete = { execute: vi.fn() };

    const controller = new EquipmentLoanController(
        mockCreate as any, mockGetAll as any, mockGetById as any,
        mockReturn as any, mockReportLost as any, mockDelete as any,
    );

    const mockReply = { status: vi.fn().mockReturnThis(), send: vi.fn() };

    beforeEach(() => { vi.clearAllMocks(); });

    describe('create', () => {
        const req = { body: { memberId: 'm1', equipmentName: 'Pelota' } };

        it('debe devolver 201', async () => {
            mockCreate.execute.mockResolvedValue({ id: '1', status: 'Active' });
            await controller.create(req as any, mockReply as any);
            expect(mockReply.status).toHaveBeenCalledWith(201);
        });

        it('debe devolver 404 si socio no existe', async () => {
            mockCreate.execute.mockRejectedValue(new Error('El socio no existe'));
            await controller.create(req as any, mockReply as any);
            expect(mockReply.status).toHaveBeenCalledWith(404);
        });

        it('debe devolver 403 si socio es Cadet', async () => {
            mockCreate.execute.mockRejectedValue(new Error('Cadet'));
            await controller.create(req as any, mockReply as any);
            expect(mockReply.status).toHaveBeenCalledWith(403);
        });
    });

    describe('returnLoan', () => {
        it('debe devolver 200', async () => {
            mockReturn.execute.mockResolvedValue({ id: '1', status: 'Returned' });
            await controller.returnLoan({ params: { id: '1' }, body: {} } as any, mockReply as any);
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });
    });

    describe('reportLost', () => {
        it('debe devolver 200', async () => {
            mockReportLost.execute.mockResolvedValue({ id: '1', status: 'Lost' });
            await controller.reportLost({ params: { id: '1' } } as any, mockReply as any);
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });
    });

    describe('delete', () => {
        it('debe devolver 204', async () => {
            mockDelete.execute.mockResolvedValue(undefined);
            await controller.delete({ params: { id: '1' } } as any, mockReply as any);
            expect(mockReply.status).toHaveBeenCalledWith(204);
        });
    });
});
