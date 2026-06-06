import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { MedicalCertificateValidator } from '../domain/services/MedicalCertificateValidator.js';
import { CreateMedicalCertificateUseCase } from '../application/CreateMedicalCertificateUseCase.js';
import { GetActiveMedicalCertificateUseCase } from '../application/GetActiveMedicalCertificateUseCase.js';
import { MedicalCertificateController } from './MedicalCertificateController.js';

// Mockeamos PostgresMedicalCertificateRepository
vi.mock('../infrastructure/PostgresMedicalCertificateRepository.js', () => {
    const certificatesStore: Record<string, any> = {};
    let nextId = 1;

    return {
        PostgresMedicalCertificateRepository: class {
            async create(data: any) {
                const id = String(nextId++);
                const now = new Date().toISOString();
                const cert = {
                    id,
                    memberId: data.memberId,
                    issueDate: now,
                    expirationDate: data.expirationDate || undefined,
                    isActive: true,
                    description: data.description || undefined,
                    doctorName: data.doctorName || undefined,
                    created_at: now,
                };
                certificatesStore[id] = cert;
                return cert;
            }

            async findActiveByMember(memberId: string) {
                const certs = Object.values(certificatesStore);
                const active = certs.find((c: any) => c.memberId === memberId && c.isActive);
                return active || null;
            }

            async deactivateAllByMember(memberId: string) {
                for (const cert of Object.values(certificatesStore)) {
                    if ((cert as any).memberId === memberId && (cert as any).isActive) {
                        (cert as any).isActive = false;
                    }
                }
            }

            async createWithDeactivation(data: any) {
                // Primero desactivamos todos los activos
                for (const cert of Object.values(certificatesStore)) {
                    if ((cert as any).memberId === data.memberId && (cert as any).isActive) {
                        (cert as any).isActive = false;
                    }
                }
                // Luego creamos el nuevo
                const id = String(nextId++);
                const now = new Date().toISOString();
                const cert = {
                    id,
                    memberId: data.memberId,
                    issueDate: now,
                    expirationDate: data.expirationDate || undefined,
                    isActive: true,
                    description: data.description || undefined,
                    doctorName: data.doctorName || undefined,
                    created_at: now,
                };
                certificatesStore[id] = cert;
                return cert;
            }
        },
    };
});

// Mockeamos PostgresMemberRepository
vi.mock('../infrastructure/PostgresMemberRepository.js', () => {
    const membersStore: Record<string, any> = {
        'member-uuid-1': { id: 'member-uuid-1', name: 'Juan Pérez', dni: '12345678', email: 'juan@test.com', category: 'Pleno', status: 'Activo', created_at: '2026-01-01' },
    };

    return {
        PostgresMemberRepository: class {
            async findById(id: string) {
                return membersStore[id] || null;
            }
            async findByDni() { return null; }
            async findAll() { return Object.values(membersStore); }
            async create(data: any) { return data; }
            async update(id: string, data: any) { return data; }
            async delete(_id: string) { }
        },
    };
});

describe('MedicalCertificate API Integration Tests', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify();

        const { PostgresMedicalCertificateRepository } = await import('../infrastructure/PostgresMedicalCertificateRepository.js');
        const { PostgresMemberRepository } = await import('../infrastructure/PostgresMemberRepository.js');
        const mcRepo = new PostgresMedicalCertificateRepository();
        const memberRepo = new PostgresMemberRepository();
        const mcValidator = new MedicalCertificateValidator();

        const createUseCase = new CreateMedicalCertificateUseCase(mcRepo, mcValidator, memberRepo);
        const getActiveUseCase = new GetActiveMedicalCertificateUseCase(mcRepo);

        const controller = new MedicalCertificateController(createUseCase, getActiveUseCase);

        app.post('/api/v1/certificados-medicos', controller.create.bind(controller));
        app.get('/api/v1/certificados-medicos/activo/:memberId', controller.getActive.bind(controller));

        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/v1/certificados-medicos', () => {
        it('debe retornar 404 si el miembro no existe', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/certificados-medicos',
                payload: {
                    memberId: 'non-existent-member',
                    expirationDate: '2026-12-31',
                },
            });

            expect(response.statusCode).toBe(404);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('Miembro no encontrado');
        });

        it('debe retornar 201 y crear el certificado exitosamente', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/certificados-medicos',
                payload: {
                    memberId: 'member-uuid-1',
                    expirationDate: '2026-12-31',
                    description: 'Certificado anual',
                    doctorName: 'Dr. Pérez',
                },
            });

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.payload);
            expect(body.data.memberId).toBe('member-uuid-1');
            expect(body.data.isActive).toBe(true);
            expect(body.data.expirationDate).toBe('2026-12-31');
            expect(body.data.description).toBe('Certificado anual');
            expect(body.data.doctorName).toBe('Dr. Pérez');
            expect(body.data.id).toBeDefined();
        });

        it('debe retornar 400 si la fecha de vencimiento es inválida', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/certificados-medicos',
                payload: {
                    memberId: 'member-uuid-1',
                    expirationDate: '2020-01-01',
                },
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('La fecha de vencimiento no puede ser anterior a la fecha de emisión');
        });

        it('debe desactivar el certificado anterior al crear uno nuevo', async () => {
            // Creamos un segundo certificado para el mismo miembro
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/certificados-medicos',
                payload: {
                    memberId: 'member-uuid-1',
                    expirationDate: '2027-06-01',
                },
            });

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.payload);
            expect(body.data.isActive).toBe(true);

            // Verificamos que el GET activo devuelva el nuevo certificado
            const getResponse = await app.inject({
                method: 'GET',
                url: '/api/v1/certificados-medicos/activo/member-uuid-1',
            });

            expect(getResponse.statusCode).toBe(200);
            const getBody = JSON.parse(getResponse.payload);
            expect(getBody.data.id).toBe(body.data.id);
            expect(getBody.data.expirationDate).toBe('2027-06-01');
        });
    });

    describe('GET /api/v1/certificados-medicos/activo/:memberId', () => {
        it('debe retornar 200 con el certificado activo', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/certificados-medicos/activo/member-uuid-1',
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.payload);
            expect(body.data.memberId).toBe('member-uuid-1');
            expect(body.data.isActive).toBe(true);
        });

        it('debe retornar 404 si no hay certificado activo', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/certificados-medicos/activo/non-existent-member',
            });

            expect(response.statusCode).toBe(404);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('No se encontró un certificado médico activo para el miembro');
        });
    });
});
