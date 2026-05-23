import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { SportValidator } from '../domain/services/SportValidator.js';
import { CreateSportUseCase } from '../application/CreateSportUseCase.js';
import { GetSportsUseCase } from '../application/GetSportsUseCase.js';
import { UpdateSportUseCase } from '../application/UpdateSportUseCase.js';
import { DeleteSportUseCase } from '../application/DeleteSportUseCase.js';
import { SportController } from './SportController.js';
import { CreateSportRequest } from '@alentapp/shared';

// Mockeamos el repositorio para que la API entera funcione sin conectarse a la Base de Datos real
// Esto nos permite testear la integración del ciclo completo: Fastify -> Controller -> UseCase -> Validator
vi.mock('../infrastructure/PostgresSportRepository.js', () => {
    // Estado interno del mock para simular la base de datos
    const sportsStore: Record<string, any> = {};
    let nextId = 1;

    return {
        PostgresSportRepository: class {
            async findAll() {
                return Object.values(sportsStore).map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    description: s.description,
                    maxCapacity: s.maxCapacity,
                    created_at: s.created_at,
                    disciplineCount: s.disciplineCount || 0,
                }));
            }

            async findById(id: string) {
                const sport = sportsStore[id];
                return sport
                    ? { id: sport.id, name: sport.name, description: sport.description, maxCapacity: sport.maxCapacity, created_at: sport.created_at }
                    : null;
            }

            async findByName(name: string) {
                const existing = Object.values(sportsStore).find((s: any) => s.name === name);
                return existing
                    ? { id: existing.id, name: existing.name, description: existing.description, maxCapacity: existing.maxCapacity, created_at: existing.created_at }
                    : null;
            }

            async create(data: any) {
                const id = String(nextId++);
                const newSport = {
                    id,
                    name: data.name,
                    description: data.description || null,
                    maxCapacity: data.maxCapacity,
                    created_at: new Date().toISOString(),
                    disciplineCount: 0,
                };
                sportsStore[id] = newSport;
                return { id: newSport.id, name: newSport.name, description: newSport.description, maxCapacity: newSport.maxCapacity, created_at: newSport.created_at };
            }

            async update(id: string, data: any) {
                const existing = sportsStore[id];
                if (!existing) {
                    throw new Error('El deporte no existe');
                }
                if (data.description !== undefined) {
                    existing.description = data.description;
                }
                if (data.maxCapacity !== undefined) {
                    existing.maxCapacity = data.maxCapacity;
                }
                return { id: existing.id, name: existing.name, description: existing.description, maxCapacity: existing.maxCapacity, created_at: existing.created_at };
            }

            async delete(id: string) {
                delete sportsStore[id];
            }

            async countDisciplines(sportId: string) {
                const sport = sportsStore[sportId];
                return sport ? (sport.disciplineCount || 0) : 0;
            }
        }
    };
});

describe('Sport API Integration Tests', () => {
    let app: FastifyInstance;
    let sportController: SportController;

    beforeAll(async () => {
        // Creamos una instancia de Fastify para el test
        app = Fastify();

        // Construimos la dependencia real: SportValidator necesita un repo (mockeado automáticamente por vi.mock)
        const { PostgresSportRepository } = await import('../infrastructure/PostgresSportRepository.js');
        const sportRepo = new PostgresSportRepository();
        const sportValidator = new SportValidator(sportRepo);

        const createSportUseCase = new CreateSportUseCase(sportRepo, sportValidator);
        const getSportsUseCase = new GetSportsUseCase(sportRepo);
        const updateSportUseCase = new UpdateSportUseCase(sportRepo, sportValidator);
        const deleteSportUseCase = new DeleteSportUseCase(sportRepo);

        sportController = new SportController(
            createSportUseCase,
            getSportsUseCase,
            updateSportUseCase,
            deleteSportUseCase,
        );

        // Registramos las rutas de Sport
        app.post('/api/v1/sports', sportController.create.bind(sportController));
        app.get('/api/v1/sports', sportController.getAll.bind(sportController));
        app.put('/api/v1/sports/:id', sportController.update.bind(sportController));
        app.delete('/api/v1/sports/:id', sportController.delete.bind(sportController));

        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/v1/sports', () => {
        it('debe retornar 200 con lista vacía cuando no hay deportes', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/sports'
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.payload);
            expect(body.data).toBeInstanceOf(Array);
            expect(body.data).toHaveLength(0);
        });
    });

    describe('POST /api/v1/sports', () => {
        it('debe retornar 201 y crear el deporte', async () => {
            const payload: CreateSportRequest = {
                name: 'Fútbol',
                description: 'Deporte de equipo',
                maxCapacity: 22,
            };

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/sports',
                payload
            });

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.payload);
            expect(body.data.name).toBe('Fútbol');
            expect(body.data.maxCapacity).toBe(22);
            expect(body.data.id).toBeDefined();
        });

        it('debe atravesar la capa de validación y retornar 409 si el nombre ya existe', async () => {
            const payload: CreateSportRequest = {
                name: 'Fútbol', // Ya fue creado en el test anterior
                maxCapacity: 22,
            };

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/sports',
                payload
            });

            expect(response.statusCode).toBe(409);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('Ya existe un deporte con ese nombre');
        });

        it('debe retornar 400 si maxCapacity no es válido', async () => {
            const payload: CreateSportRequest = {
                name: 'Natación',
                maxCapacity: 0,
            };

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/sports',
                payload
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('La capacidad máxima debe ser un número entero positivo');
        });
    });

    describe('GET /api/v1/sports (con datos)', () => {
        it('debe retornar 200 con los deportes creados', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/sports'
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.payload);
            expect(body.data).toBeInstanceOf(Array);
            expect(body.data.length).toBeGreaterThan(0);
            expect(body.data[0].name).toBeDefined();
            expect(body.data[0].disciplineCount).toBeDefined();
        });
    });

    describe('PUT /api/v1/sports/:id', () => {
        it('debe retornar 200 con los datos actualizados', async () => {
            // Primero obtenemos el ID del deporte creado
            const getResponse = await app.inject({
                method: 'GET',
                url: '/api/v1/sports'
            });
            const sports = JSON.parse(getResponse.payload).data;
            const sportId = sports[0].id;

            const response = await app.inject({
                method: 'PUT',
                url: `/api/v1/sports/${sportId}`,
                payload: { description: 'Deporte actualizado', maxCapacity: 30 }
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.payload);
            expect(body.data.description).toBe('Deporte actualizado');
            expect(body.data.maxCapacity).toBe(30);
            expect(body.data.name).toBe('Fútbol'); // name no cambia
        });

        it('debe retornar 400 si se intenta modificar el nombre', async () => {
            const getResponse = await app.inject({
                method: 'GET',
                url: '/api/v1/sports'
            });
            const sports = JSON.parse(getResponse.payload).data;
            const sportId = sports[0].id;

            const response = await app.inject({
                method: 'PUT',
                url: `/api/v1/sports/${sportId}`,
                payload: { name: 'Otro nombre' }
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('No se puede modificar el nombre del deporte');
        });

        it('debe retornar 404 si el deporte no existe', async () => {
            const response = await app.inject({
                method: 'PUT',
                url: '/api/v1/sports/nonexistent-id',
                payload: { description: 'test' }
            });

            expect(response.statusCode).toBe(404);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('El deporte no existe');
        });
    });

    describe('DELETE /api/v1/sports/:id', () => {
        it('debe retornar 204 si se elimina correctamente', async () => {
            // Creamos un deporte para eliminar
            const createResponse = await app.inject({
                method: 'POST',
                url: '/api/v1/sports',
                payload: { name: 'DeporteAEliminar', maxCapacity: 10 }
            });
            const createdSport = JSON.parse(createResponse.payload).data;

            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/sports/${createdSport.id}`
            });

            expect(response.statusCode).toBe(204);
            expect(response.payload).toBe('');
        });

        it('debe retornar 404 si el deporte a eliminar no existe', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: '/api/v1/sports/nonexistent-id'
            });

            expect(response.statusCode).toBe(404);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('El deporte no existe');
        });
    });
});
