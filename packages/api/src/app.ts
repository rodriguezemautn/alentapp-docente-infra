import Fastify from 'fastify';
import cors from '@fastify/cors';
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
import { PostgresLockerRepository, PostgresLockerAssignmentLogRepository } from './infrastructure/PostgresLockerRepository.js';
import { LockerValidator } from './domain/services/LockerValidator.js';
import { CreateLockerUseCase } from './application/CreateLockerUseCase.js';
import { GetLockersUseCase } from './application/GetLockersUseCase.js';
import { GetLockerByIdUseCase } from './application/GetLockerByIdUseCase.js';
import { UpdateLockerUseCase } from './application/UpdateLockerUseCase.js';
import { DeleteLockerUseCase } from './application/DeleteLockerUseCase.js';
import { LockerController } from './delivery/LockerController.js';
import { GetLockerHistoryUseCase } from './application/GetLockerHistoryUseCase.js';
import { PostgresEquipmentLoanRepository } from './infrastructure/PostgresEquipmentLoanRepository.js';
import { EquipmentLoanValidator } from './domain/services/EquipmentLoanValidator.js';
import { CreateEquipmentLoanUseCase } from './application/CreateEquipmentLoanUseCase.js';
import { GetEquipmentLoansUseCase } from './application/GetEquipmentLoansUseCase.js';
import { GetEquipmentLoanByIdUseCase } from './application/GetEquipmentLoanByIdUseCase.js';
import { ReturnEquipmentLoanUseCase } from './application/ReturnEquipmentLoanUseCase.js';
import { ReportLostEquipmentLoanUseCase } from './application/ReportLostEquipmentLoanUseCase.js';
import { DeleteEquipmentLoanUseCase } from './application/DeleteEquipmentLoanUseCase.js';
import { EquipmentLoanController } from './delivery/EquipmentLoanController.js';
import { GetIncomeReportUseCase } from './application/GetIncomeReportUseCase.js';
import { GetLockerReportUseCase } from './application/GetLockerReportUseCase.js';
import { GetMaterialReportUseCase } from './application/GetMaterialReportUseCase.js';
import { GetMemberReportUseCase } from './application/GetMemberReportUseCase.js';
import { ReportController } from './delivery/ReportController.js';

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

    const lockerRepo = new PostgresLockerRepository();
    const lockerValidator = new LockerValidator(lockerRepo);
    const lockerLogRepo = new PostgresLockerAssignmentLogRepository();

    const createLockerUseCase = new CreateLockerUseCase(lockerRepo, lockerValidator);
    const getLockersUseCase = new GetLockersUseCase(lockerRepo);
    const getLockerByIdUseCase = new GetLockerByIdUseCase(lockerRepo);
    const updateLockerUseCase = new UpdateLockerUseCase(lockerRepo, lockerValidator);
    const deleteLockerUseCase = new DeleteLockerUseCase(lockerRepo, lockerValidator);
    const getLockerHistoryUseCase = new GetLockerHistoryUseCase(lockerLogRepo);

    const lockerController = new LockerController(
      createLockerUseCase,
      getLockersUseCase,
      getLockerByIdUseCase,
      updateLockerUseCase,
      deleteLockerUseCase,
    );

    server.post('/api/v1/casilleros', lockerController.create.bind(lockerController));
    server.get('/api/v1/casilleros', lockerController.getAll.bind(lockerController));
    server.get('/api/v1/casilleros/:id', lockerController.getById.bind(lockerController));
    server.put('/api/v1/casilleros/:id', lockerController.update.bind(lockerController));
    server.delete('/api/v1/casilleros/:id', lockerController.delete.bind(lockerController));
    server.get('/api/v1/historial/casilleros', async (req, rep) => {
      try {
        const { lockerId, memberId } = req.query as { lockerId?: string; memberId?: string };
        const history = await getLockerHistoryUseCase.execute({ lockerId, memberId });
        return rep.status(200).send({ data: history });
      } catch (error: any) {
        return rep.status(500).send({ error: error.message });
      }
    });

    const equipmentLoanRepo = new PostgresEquipmentLoanRepository();
    const equipmentLoanValidator = new EquipmentLoanValidator();

    const createEquipmentLoanUseCase = new CreateEquipmentLoanUseCase(equipmentLoanRepo, memberRepo, equipmentLoanValidator);
    const getEquipmentLoansUseCase = new GetEquipmentLoansUseCase(equipmentLoanRepo);
    const getEquipmentLoanByIdUseCase = new GetEquipmentLoanByIdUseCase(equipmentLoanRepo);
    const returnEquipmentLoanUseCase = new ReturnEquipmentLoanUseCase(equipmentLoanRepo, equipmentLoanValidator);
    const reportLostEquipmentLoanUseCase = new ReportLostEquipmentLoanUseCase(equipmentLoanRepo, equipmentLoanValidator);
    const deleteEquipmentLoanUseCase = new DeleteEquipmentLoanUseCase(equipmentLoanRepo, equipmentLoanValidator);

    const equipmentLoanController = new EquipmentLoanController(
      createEquipmentLoanUseCase,
      getEquipmentLoansUseCase,
      getEquipmentLoanByIdUseCase,
      returnEquipmentLoanUseCase,
      reportLostEquipmentLoanUseCase,
      deleteEquipmentLoanUseCase,
    );

    server.post('/api/v1/prestamos-equipamiento', equipmentLoanController.create.bind(equipmentLoanController));
    server.get('/api/v1/prestamos-equipamiento', equipmentLoanController.getAll.bind(equipmentLoanController));
    server.get('/api/v1/prestamos-equipamiento/:id', equipmentLoanController.getById.bind(equipmentLoanController));
    server.put('/api/v1/prestamos-equipamiento/:id/return', equipmentLoanController.returnLoan.bind(equipmentLoanController));
    server.put('/api/v1/prestamos-equipamiento/:id/report-lost', equipmentLoanController.reportLost.bind(equipmentLoanController));
    server.delete('/api/v1/prestamos-equipamiento/:id', equipmentLoanController.delete.bind(equipmentLoanController));

    const incomeReportUseCase = new GetIncomeReportUseCase(paymentRepo);
    const lockerReportUseCase = new GetLockerReportUseCase(lockerRepo);
    const materialReportUseCase = new GetMaterialReportUseCase(equipmentLoanRepo);
    const memberReportUseCase = new GetMemberReportUseCase(memberRepo);

    const reportController = new ReportController(
      incomeReportUseCase,
      lockerReportUseCase,
      materialReportUseCase,
      memberReportUseCase,
    );

    server.get('/api/v1/reportes/ingresos', reportController.getIncomeReport.bind(reportController));
    server.get('/api/v1/reportes/casilleros', reportController.getLockerReport.bind(reportController));
    server.get('/api/v1/reportes/material', reportController.getMaterialReport.bind(reportController));
    server.get('/api/v1/reportes/socios', reportController.getMemberReport.bind(reportController));

    server.get('/', async (req, rep) => {
        rep.status(200).send({ msg: 'asd' })
    });

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