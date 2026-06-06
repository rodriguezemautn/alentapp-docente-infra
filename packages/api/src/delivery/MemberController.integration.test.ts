import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { CreateMemberRequest } from '@alentapp/shared';

// Mockeamos el repositorio para que la API entera funcione sin conectarse a la Base de Datos real
// Esto nos permite testear la integración del ciclo completo: Fastify -> Controller -> UseCase -> Validator
vi.mock('../infrastructure/PostgresMemberRepository.js', () => {
    return {
        PostgresMemberRepository: class {
            async findAll() { return [{ id: '1', name: 'Socio Existente' }]; }
            async findById(id: string) { return id === '1' ? { id: '1', name: 'Socio Existente', birthdate: '1990-01-01' } : null; }
            async findByDni(dni: string) { return dni === '12345678' ? { id: '1', dni: '12345678' } : null; }
            async create(data: any) { return { id: '2', ...data, category: data.category || 'Pleno', status: 'Activo' }; }
            async update(id: string, data: any) { return { id, ...data }; }
            async delete(_id: string) { return; }
        }
    };
});

// Mockeamos PostgresSportRepository para que app.ts no falle al importarlo sin DATABASE_URL
vi.mock('../infrastructure/PostgresSportRepository.js', () => {
    return {
        PostgresSportRepository: class {
            async findAll() { return []; }
            async findById() { return null; }
            async findByName() { return null; }
            async create(data: any) { return { id: 'sport-1', ...data }; }
            async update(id: string, data: any) { return { id, ...data }; }
            async delete() { return; }
            async countDisciplines() { return 0; }
        }
    };
});

// Mockeamos PostgresPaymentRepository para que app.ts no falle
vi.mock('../infrastructure/PostgresPaymentRepository.js', () => {
    const paymentsStore: Record<string, any> = {};
    let nextId = 1;
    return {
        PostgresPaymentRepository: class {
            async findAll() { return Object.values(paymentsStore); }
            async findById(id: string) { return paymentsStore[id] || null; }
            async create(data: any) {
                const id = String(nextId++);
                paymentsStore[id] = { id, ...data, created_at: new Date().toISOString() };
                return paymentsStore[id];
            }
            async updateStatus(id: string, status: string) {
                if (paymentsStore[id]) paymentsStore[id].status = status;
                return paymentsStore[id] || null;
            }
            async getIncomeReport() { return { total: 0, count: 0 }; }
        }
    };
});

// Mockeamos PostgresMedicalCertificateRepository
vi.mock('../infrastructure/PostgresMedicalCertificateRepository.js', () => {
    return {
        PostgresMedicalCertificateRepository: class {
            async create(data: any) { return { id: 'mc-1', ...data }; }
            async findActiveByMemberId() { return null; }
            async deactivateAllForMember() { return; }
        }
    };
});

// Mockeamos PostgresDisciplineRepository
vi.mock('../infrastructure/PostgresDisciplineRepository.js', () => {
    return {
        PostgresDisciplineRepository: class {
            async findAll() { return []; }
            async findById() { return null; }
            async findBySportId() { return []; }
            async create(data: any) { return { id: 'disc-1', ...data }; }
            async update() { return null; }
            async delete() { return; }
        }
    };
});

// Mockeamos PostgresLockerRepository (exporta dos clases)
vi.mock('../infrastructure/PostgresLockerRepository.js', () => {
    return {
        PostgresLockerRepository: class {
            async findAll() { return []; }
            async findById() { return null; }
            async findByNumber() { return null; }
            async create(data: any) { return { id: 'locker-1', ...data }; }
            async update() { return null; }
            async delete() { return; }
            async getLockerReport() { return { total: 0, assigned: 0, available: 0 }; }
        },
        PostgresLockerAssignmentLogRepository: class {
            async create(data: any) { return { id: 'log-1', ...data }; }
            async findByLockerId() { return []; }
            async findByMemberId() { return []; }
            async findAll() { return []; }
        }
    };
});

// Mockeamos PostgresEquipmentLoanRepository
vi.mock('../infrastructure/PostgresEquipmentLoanRepository.js', () => {
    return {
        PostgresEquipmentLoanRepository: class {
            async findAll() { return []; }
            async findById() { return null; }
            async create(data: any) { return { id: 'loan-1', ...data }; }
            async updateStatus() { return null; }
            async delete() { return; }
            async getMaterialReport() { return { total: 0, active: 0, returned: 0, lost: 0 }; }
        }
    };
});

describe('Member API Integration Tests', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = buildApp();
        await app.ready(); // Esperamos a que todos los plugins (como CORS) carguen
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/v1/socios', () => {
        it('debe retornar código 200 y el listado de socios', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/socios'
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.payload);
            expect(body.data).toBeInstanceOf(Array);
            expect(body.data[0].id).toBe('1');
            expect(body.data[0].name).toBe('Socio Existente');
        });
    });

    describe('POST /api/v1/socios', () => {
        it('debe retornar 201 y crear al socio', async () => {
            const payload: CreateMemberRequest = {
                name: 'Nuevo Integracion',
                dni: '88888888',
                email: 'nuevo@test.com',
                birthdate: '1995-01-01',
                category: 'Pleno'
            };

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/socios',
                payload
            });

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.payload);
            expect(body.data.name).toBe('Nuevo Integracion');
            expect(body.data.id).toBeDefined();
        });

        it('debe atravesar la capa de validación y retornar 409 si el DNI existe', async () => {
            const payload: CreateMemberRequest = {
                name: 'Copia',
                dni: '12345678', // Este DNI lo mockeamos arriba como existente
                email: 'copia@test.com',
                birthdate: '1995-01-01',
                category: 'Pleno'
            };

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/socios',
                payload
            });

            expect(response.statusCode).toBe(409);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('Ya existe un miembro con ese DNI');
        });

        it('debe retornar 400 si el email no es válido', async () => {
            const payload: CreateMemberRequest = {
                name: 'Invalido',
                dni: '11111111',
                email: 'correo-sin-arroba',
                birthdate: '1995-01-01',
                category: 'Pleno'
            };

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/socios',
                payload
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('Formato de correo electrónico inválido');
        });
    });

    describe('DELETE /api/v1/socios/:id', () => {
        it('debe retornar 204 si se elimina correctamente', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: '/api/v1/socios/1' // Sabemos que el ID 1 existe en nuestro mock
            });

            expect(response.statusCode).toBe(204);
            expect(response.payload).toBe('');
        });

        it('debe retornar 400 si el socio a eliminar no existe', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: '/api/v1/socios/999' // No existe
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('El miembro no existe');
        });
    });
});
