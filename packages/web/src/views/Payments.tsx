import {
  Table,
  Button,
  Heading,
  HStack,
  IconButton,
  Stack,
  Text,
  Box,
  Flex,
  Spinner,
  Center,
  Input,
  Badge,
} from "@chakra-ui/react";
import { LuPlus, LuRefreshCw, LuBan } from "react-icons/lu";
import { useEffect, useState, useMemo } from "react";
import { paymentsService } from "../services/payments";
import { membersService } from "../services/members";
import type {
  PaymentDTO,
  CreatePaymentRequest,
  PaymentFilters,
  PaymentType,
  PaymentStatus,
  MemberDTO,
} from "@alentapp/shared";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  DialogCloseTrigger,
} from "../components/ui/dialog";
import { Field } from "../components/ui/field";
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
  createListCollection,
} from "../components/ui/select";
import { toaster } from "../components/ui/toaster";
import { PAYMENT_TYPES, PAYMENT_TYPES_FILTER, PAYMENT_STATUSES_FILTER } from "../constants";

const PAGE_LIMIT = 10;

export function PaymentsView() {
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [filterMemberId, setFilterMemberId] = useState("");
  const [filterPaymentType, setFilterPaymentType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Form state
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    memberId: "",
    amount: 0,
    paymentDate: "",
    paymentType: "Cuota",
  });

  // Member lookup map
  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m) => map.set(m.id, m.name));
    return map;
  }, [members]);

  const memberFilterCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Todos los miembros", value: "" },
          ...members.map((m) => ({ label: m.name, value: m.id })),
        ],
      }),
    [members]
  );

  const memberFormCollection = useMemo(
    () =>
      createListCollection({
        items: members.map((m) => ({ label: m.name, value: m.id })),
      }),
    [members]
  );

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  const buildFilters = (pageOverride?: number): PaymentFilters => {
    const f: PaymentFilters = { page: pageOverride || page, limit: PAGE_LIMIT };
    if (filterMemberId) f.memberId = filterMemberId;
    if (filterPaymentType) f.paymentType = filterPaymentType as PaymentType;
    if (filterStatus) f.status = filterStatus as PaymentStatus;
    if (filterFrom) f.from = filterFrom;
    if (filterTo) f.to = filterTo;
    return f;
  };

  const fetchPayments = async (filtersOverride?: PaymentFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = filtersOverride || buildFilters();
      const result = await paymentsService.getAll(filters);
      setPayments(result.data);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || "Error al cargar los pagos");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await membersService.getAll();
      setMembers(data);
    } catch { /* Silently fail — members are auxiliary */ }
  };

  useEffect(() => {
    fetchMembers();
    fetchPayments();
  }, []);

  const handleApplyFilters = () => {
    setPage(1);
    fetchPayments({ page: 1, limit: PAGE_LIMIT, ...buildFilters(1) });
  };

  const handleClearFilters = () => {
    setFilterMemberId("");
    setFilterPaymentType("");
    setFilterStatus("");
    setFilterFrom("");
    setFilterTo("");
    setPage(1);
    fetchPayments({ page: 1, limit: PAGE_LIMIT });
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
    fetchPayments({ ...buildFilters(newPage), page: newPage });
  };

  const openCreateModal = () => {
    setFormData({
      memberId: members.length > 0 ? members[0].id : "",
      amount: 0,
      paymentDate: "",
      paymentType: "Cuota",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: CreatePaymentRequest = {
        memberId: formData.memberId,
        amount: formData.amount,
        paymentType: formData.paymentType,
      };
      if (formData.paymentDate) payload.paymentDate = formData.paymentDate;

      const created = await paymentsService.create(payload);
      setPayments((prev) => [created, ...prev]);
      setTotal((t) => t + 1);
      setIsDialogOpen(false);
      toaster.create({ title: "Pago creado", type: "success" });
    } catch (err: any) {
      toaster.create({ title: err.message || "Error al crear el pago", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPayment = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar este pago?")) return;
    try {
      await paymentsService.cancel(id);
      // Optimistic update: mark as canceled locally
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "Canceled" as PaymentStatus } : p))
      );
      toaster.create({ title: "Pago cancelado", type: "success" });
    } catch (err: any) {
      toaster.create({ title: err.message || "Error al cancelar el pago", type: "error" });
    }
  };

  return (
    <DialogRoot open={isDialogOpen} onOpenChange={(e) => !e.open && setIsDialogOpen(false)}>
      <Stack gap="8">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">Administración de Pagos</Heading>
            <Text color="fg.muted" fontSize="md">
              Gestiona los pagos realizados por los socios del club.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={() => fetchPayments()} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Agregar Pago
            </Button>
          </HStack>
        </Flex>

        {/* Filters bar */}
        <Flex gap="4" align="flex-end" wrap="wrap" p="4" bg="bg.muted/30" borderRadius="lg" borderWidth="1px">
          <Field label="Miembro">
            <SelectRoot
              collection={memberFilterCollection}
              value={[filterMemberId]}
              onValueChange={(e) => setFilterMemberId(e.value[0] || "")}
            >
              <SelectTrigger>
                <SelectValueText placeholder="Todos los miembros" />
              </SelectTrigger>
              <SelectContent>
                {memberFilterCollection.items.map((item) => (
                  <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Field>

          <Field label="Tipo">
            <SelectRoot
              collection={PAYMENT_TYPES_FILTER}
              value={[filterPaymentType]}
              onValueChange={(e) => setFilterPaymentType(e.value[0] || "")}
            >
              <SelectTrigger>
                <SelectValueText placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TYPES_FILTER.items.map((item) => (
                  <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Field>

          <Field label="Estado">
            <SelectRoot
              collection={PAYMENT_STATUSES_FILTER}
              value={[filterStatus]}
              onValueChange={(e) => setFilterStatus(e.value[0] || "")}
            >
              <SelectTrigger>
                <SelectValueText placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES_FILTER.items.map((item) => (
                  <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Field>

          <Field label="Desde">
            <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} maxW="180px" />
          </Field>

          <Field label="Hasta">
            <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} maxW="180px" />
          </Field>

          <HStack gap="2" align="end" pb="1">
            <Button colorPalette="blue" size="sm" onClick={handleApplyFilters}>Filtrar</Button>
            <Button variant="outline" size="sm" onClick={handleClearFilters}>Limpiar</Button>
          </HStack>
        </Flex>

        {/* Create Modal */}
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Pago</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="Miembro" required>
                  <SelectRoot
                    collection={memberFormCollection}
                    value={[formData.memberId]}
                    onValueChange={(e) => setFormData({ ...formData, memberId: e.value[0] || "" })}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Seleccione un miembro" />
                    </SelectTrigger>
                    <SelectContent>
                      {memberFormCollection.items.map((item) => (
                        <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>

                <Field label="Monto" required>
                  <Input
                    type="number" step="0.01" min={0.01}
                    placeholder="Ej. 150.00"
                    value={formData.amount || ""}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </Field>

                <Field label="Tipo" required>
                  <SelectRoot
                    collection={PAYMENT_TYPES}
                    value={[formData.paymentType]}
                    onValueChange={(e) => setFormData({ ...formData, paymentType: e.value[0] as PaymentType })}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TYPES.items.map((item) => (
                        <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>

                <Field label="Fecha (opcional)">
                  <Input type="date" value={formData.paymentDate || ""} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} />
                </Field>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>
              <Button type="submit" colorPalette="blue" loading={isSubmitting}>Crear Pago</Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </form>
        </DialogContent>

        {/* Error state */}
        {error && (
          <Box p="4" bg="red.50" color="red.700" borderRadius="md" border="1px solid" borderColor="red.200">
            <Text fontWeight="bold">Error:</Text>
            <Text>{error}</Text>
          </Box>
        )}

        {/* Table */}
        <Box bg="bg.panel" borderRadius="xl" boxShadow="sm" borderWidth="1px" overflow="hidden" minH="300px" position="relative">
          {isLoading ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Spinner size="xl" color="blue.500" />
                <Text color="fg.muted">Cargando pagos...</Text>
              </Stack>
            </Center>
          ) : payments.length === 0 ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Text color="fg.muted">No se encontraron pagos.</Text>
                <Button variant="ghost" onClick={() => fetchPayments()}>Reintentar</Button>
              </Stack>
            </Center>
          ) : (
            <Table.Root size="md" variant="line" interactive>
              <Table.Header>
                <Table.Row bg="bg.muted/50">
                  <Table.ColumnHeader py="4">Miembro</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Monto</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Tipo</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Fecha</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Estado</Table.ColumnHeader>
                  <Table.ColumnHeader py="4" textAlign="end">Acciones</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {payments.map((payment) => {
                  const isCanceled = payment.status === "Canceled";
                  return (
                    <Table.Row key={payment.id} opacity={isCanceled ? 0.6 : 1} bg={isCanceled ? "gray.50" : undefined}>
                      <Table.Cell fontWeight="semibold" color="fg.emphasized" textDecoration={isCanceled ? "line-through" : undefined}>
                        {memberMap.get(payment.memberId) || payment.memberId}
                      </Table.Cell>
                      <Table.Cell textDecoration={isCanceled ? "line-through" : undefined}>
                        ${payment.amount.toFixed(2)}
                      </Table.Cell>
                      <Table.Cell color="fg.muted" textDecoration={isCanceled ? "line-through" : undefined}>
                        {payment.paymentType === "Inscripcion" ? "Inscripción" : payment.paymentType}
                      </Table.Cell>
                      <Table.Cell color="fg.muted" textDecoration={isCanceled ? "line-through" : undefined}>
                        {new Date(payment.paymentDate).toLocaleDateString("es-AR")}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={isCanceled ? "red" : "green"} size="sm">
                          {isCanceled ? "Cancelado" : "Completado"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell textAlign="end">
                        {!isCanceled && (
                          <IconButton variant="ghost" size="sm" colorPalette="red" aria-label="Cancelar pago" onClick={() => handleCancelPayment(payment.id)}>
                            <LuBan />
                          </IconButton>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Flex justify="center" align="center" gap="4" py="2">
            <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
              Anterior
            </Button>
            <Text fontSize="sm" color="fg.muted">Página {page} de {totalPages}</Text>
            <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
              Siguiente
            </Button>
          </Flex>
        )}
      </Stack>
    </DialogRoot>
  );
}
