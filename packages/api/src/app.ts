import Fastify from 'fastify';
import cors from '@fastify/cors';
import metrics from 'fastify-metrics';
import { PostgresMemberRepository } from './infrastructure/PostgresMemberRepository.js';
import { MemberValidator } from './domain/services/MemberValidator.js';
import { CreateMemberUseCase } from './application/NewMemberUseCase.js';
import { GetMembersUseCase } from './application/GetMembersUseCase.js';
import { UpdateMemberUseCase } from './application/UpdateMemberUseCase.js';
import { DeleteMemberUseCase } from './application/DeleteMemberUseCase.js';
import { MemberController } from './delivery/MemberController.js';
import { PostgresSportRepository } from './infrastructure/PostgresSportRepository.js';
import { SportValidator } from './domain/services/SportValidator.js';
import { CreateSportUseCase } from './application/CreateSportUseCase.js';
import { GetSportsUseCase } from './application/GetSportsUseCase.js';
import { UpdateSportUseCase } from './application/UpdateSportUseCase.js';
import { DeleteSportUseCase } from './application/DeleteSportUseCase.js';
import { SportController } from './delivery/SportController.js';
import { PostgresPaymentRepository } from './infrastructure/PostgresPaymentRepository.js';
import { PaymentValidator } from './domain/services/PaymentValidator.js';
import { CreatePaymentUseCase } from './application/CreatePaymentUseCase.js';
import { GetPaymentsUseCase } from './application/GetPaymentsUseCase.js';
import { GetPaymentByIdUseCase } from './application/GetPaymentByIdUseCase.js';
import { CancelPaymentUseCase } from './application/CancelPaymentUseCase.js';
import { PaymentController } from './delivery/PaymentController.js';
import { PostgresMedicalCertificateRepository } from './infrastructure/PostgresMedicalCertificateRepository.js';
import { MedicalCertificateValidator } from './domain/services/MedicalCertificateValidator.js';
import { CreateMedicalCertificateUseCase } from './application/CreateMedicalCertificateUseCase.js';
import { GetActiveMedicalCertificateUseCase } from './application/GetActiveMedicalCertificateUseCase.js';
import { MedicalCertificateController } from './delivery/MedicalCertificateController.js';
import { PostgresDisciplineRepository } from './infrastructure/PostgresDisciplineRepository.js';
import { DisciplineValidator } from './domain/services/DisciplineValidator.js';
import { CreateDisciplineUseCase } from './application/CreateDisciplineUseCase.js';
import { GetDisciplinesUseCase } from './application/GetDisciplinesUseCase.js';
import { GetDisciplineByIdUseCase } from './application/GetDisciplineByIdUseCase.js';
import { UpdateDisciplineUseCase } from './application/UpdateDisciplineUseCase.js';
import { DeleteDisciplineUseCase } from './application/DeleteDisciplineUseCase.js';
import { DisciplineController } from './delivery/DisciplineController.js';

export function buildApp() {
    const server = Fastify({
        logger: {
            level: 'info',
            transport: process.env.NODE_ENV === 'development' 
            ? {
                target: 'pino-pretty',
                options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
                } 
            : undefined,
        },
    });

    server.register(cors, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    const memberRepo = new PostgresMemberRepository();
    const memberValidator = new MemberValidator(memberRepo);
    
    const createMemberUseCase = new CreateMemberUseCase(memberRepo, memberValidator);
    const getMembersUseCase = new GetMembersUseCase(memberRepo);
    const updateMemberUseCase = new UpdateMemberUseCase(memberRepo, memberValidator);
    const deleteMemberUseCase = new DeleteMemberUseCase(memberRepo);

    const memberController = new MemberController(
        createMemberUseCase, 
        getMembersUseCase,
        updateMemberUseCase,
        deleteMemberUseCase
    );

    server.get('/api/v1/socios', memberController.getAll.bind(memberController));
    server.post('/api/v1/socios', memberController.create.bind(memberController));
    server.put('/api/v1/socios/:id', memberController.update.bind(memberController));
    server.delete('/api/v1/socios/:id', memberController.delete.bind(memberController));

    const sportRepo = new PostgresSportRepository();
    const sportValidator = new SportValidator(sportRepo);

    const createSportUseCase = new CreateSportUseCase(sportRepo, sportValidator);
    const getSportsUseCase = new GetSportsUseCase(sportRepo);
    const updateSportUseCase = new UpdateSportUseCase(sportRepo, sportValidator);
    const deleteSportUseCase = new DeleteSportUseCase(sportRepo);

    const sportController = new SportController(
        createSportUseCase,
        getSportsUseCase,
        updateSportUseCase,
        deleteSportUseCase,
    );

    server.post('/api/v1/sports', sportController.create.bind(sportController));
    server.get('/api/v1/sports', sportController.getAll.bind(sportController));
    server.put('/api/v1/sports/:id', sportController.update.bind(sportController));
    server.delete('/api/v1/sports/:id', sportController.delete.bind(sportController));

    const paymentRepo = new PostgresPaymentRepository();
    const paymentValidator = new PaymentValidator();

    const createPaymentUseCase = new CreatePaymentUseCase(paymentRepo, memberRepo, paymentValidator);
    const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepo, paymentValidator);
    const getPaymentByIdUseCase = new GetPaymentByIdUseCase(paymentRepo);
    const cancelPaymentUseCase = new CancelPaymentUseCase(paymentRepo, paymentValidator);

    const paymentController = new PaymentController(
        createPaymentUseCase,
        getPaymentsUseCase,
        getPaymentByIdUseCase,
        cancelPaymentUseCase,
    );

    server.post('/api/v1/pagos', paymentController.create.bind(paymentController));
    server.get('/api/v1/pagos', paymentController.getAll.bind(paymentController));
    server.get('/api/v1/pagos/:id', paymentController.getById.bind(paymentController));
    server.put('/api/v1/pagos/:id/cancel', paymentController.cancel.bind(paymentController));

    const mcRepo = new PostgresMedicalCertificateRepository();
    const mcValidator = new MedicalCertificateValidator();

    const createMedicalCertificateUseCase = new CreateMedicalCertificateUseCase(mcRepo, mcValidator, memberRepo);
    const getActiveMedicalCertificateUseCase = new GetActiveMedicalCertificateUseCase(mcRepo);

    const medicalCertificateController = new MedicalCertificateController(
        createMedicalCertificateUseCase,
        getActiveMedicalCertificateUseCase,
    );

    server.post('/api/v1/certificados-medicos', medicalCertificateController.create.bind(medicalCertificateController));
    server.get('/api/v1/certificados-medicos/activo/:memberId', medicalCertificateController.getActive.bind(medicalCertificateController));

    const disciplineRepo = new PostgresDisciplineRepository();
    const disciplineValidator = new DisciplineValidator(sportRepo);

    const createDisciplineUseCase = new CreateDisciplineUseCase(disciplineRepo, disciplineValidator);
    const getDisciplinesUseCase = new GetDisciplinesUseCase(disciplineRepo);
    const getDisciplineByIdUseCase = new GetDisciplineByIdUseCase(disciplineRepo);
    const updateDisciplineUseCase = new UpdateDisciplineUseCase(disciplineRepo, disciplineValidator);
    const deleteDisciplineUseCase = new DeleteDisciplineUseCase(disciplineRepo);

    const disciplineController = new DisciplineController(
      createDisciplineUseCase,
      getDisciplinesUseCase,
      getDisciplineByIdUseCase,
      updateDisciplineUseCase,
      deleteDisciplineUseCase,
    );

    server.post('/api/v1/disciplinas', disciplineController.create.bind(disciplineController));
    server.get('/api/v1/disciplinas', disciplineController.getAll.bind(disciplineController));
    server.get('/api/v1/disciplinas/:id', disciplineController.getById.bind(disciplineController));
    server.put('/api/v1/disciplinas/:id', disciplineController.update.bind(disciplineController));
    server.delete('/api/v1/disciplinas/:id', disciplineController.delete.bind(disciplineController));

    server.get('/', async (req, rep) => {
        rep.status(200).send({ msg: 'asd' })
    });

    // Métricas Prometheus (solo en producción o cuando se solicita)
    server.register(metrics, { endpoint: '/metrics' });

    return server;
}

// Solo iniciar el servidor si el script se ejecuta directamente (no cuando es importado por vitest)
if (process.argv[1] && process.argv[1].endsWith('app.ts')) {
    const server = buildApp();
    const port = parseInt(process.env.PORT || '3000', 10);

    server.listen({ port, host: '0.0.0.0' }, () =>
        server.log.info(`API server running on http://localhost:${port}`)
    );

    ['SIGINT', 'SIGTERM'].forEach((signal) => {
        process.on(signal, async () => {
            await server.close();
            process.exit(0);
        });
    });
}