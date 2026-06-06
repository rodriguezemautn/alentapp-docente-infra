/**
 * OpenTelemetry — Inicialización y métricas RED
 *
 * Se inicia como side-effect al importarse (MUST ser el primer import en app.ts).
 * Expone métricas en :9464/metrics via PrometheusExporter.
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { metrics, Meter } from '@opentelemetry/api';

// =============================================================================
// Configuración del exportador Prometheus
// =============================================================================
const prometheusExporter = new PrometheusExporter({
    port: 9464,
    endpoint: '/metrics',
});

// =============================================================================
// SDK Node.js con auto-instrumentaciones
// =============================================================================
const sdk = new NodeSDK({
    metricReader: prometheusExporter,
    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-http': {},
        }),
    ],
});

sdk.start();

// =============================================================================
// Meter global para métricas personalizadas
// =============================================================================
const meter = metrics.getMeter('alentapp-api');

/**
 * Crea las métricas RED (Rate, Errors, Duration) y las expone como
 * Counters/Histogram via OpenTelemetry.
 */
export function createREDMetrics(meterInstance: Meter) {
    const requestCounter = meterInstance.createCounter('http.requests.total', {
        description: 'Total de requests HTTP',
    });

    const errorCounter = meterInstance.createCounter('http.requests.errors', {
        description: 'Total de errores HTTP (4xx/5xx)',
    });

    const requestDuration = meterInstance.createHistogram('http.request.duration', {
        description: 'Duración de requests HTTP en ms',
        unit: 'ms',
    });

    return { requestCounter, errorCounter, requestDuration };
}

/**
 * Crea métricas de proceso para monitoreo USE.
 */
export function createProcessMetrics(meterInstance: Meter) {
    const memoryUsage = meterInstance.createGauge('process.memory.usage', {
        description: 'Uso de memoria del proceso en bytes',
        unit: 'bytes',
    });

    const activeRequests = meterInstance.createGauge('http.requests.active', {
        description: 'Requests concurrentes activos',
    });

    return { memoryUsage, activeRequests };
}

/**
 * Crea métricas de negocio para el dashboard Business.
 */
export function createBusinessMetrics(meterInstance: Meter) {
    const activeMembers = meterInstance.createGauge('business.members.active', {
        description: 'Cantidad de socios activos',
    });

    const activeLoans = meterInstance.createGauge('business.loans.active', {
        description: 'Préstamos activos actualmente',
    });

    const lockerOccupancy = meterInstance.createGauge('business.lockers.occupancy', {
        description: 'Porcentaje de ocupación de casilleros',
        unit: '%',
    });

    const dailyRevenue = meterInstance.createCounter('business.revenue.daily', {
        description: 'Ingresos del día',
    });

    return { activeMembers, activeLoans, lockerOccupancy, dailyRevenue };
}

// Crear métricas globales (se actualizan periódicamente desde la aplicación)
export const redMetrics = createREDMetrics(meter);
export const processMetrics = createProcessMetrics(meter);
export const businessMetrics = createBusinessMetrics(meter);

/**
 * Actualiza las métricas de proceso (llamar periódicamente).
 */
export function updateProcessMetrics() {
    const mem = process.memoryUsage();
    processMetrics.memoryUsage.record(mem.heapUsed);
}

export { sdk, meter, prometheusExporter };
