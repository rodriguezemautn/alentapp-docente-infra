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
import { LuPlus, LuTrash2, LuRefreshCw, LuUndo2, LuAlertTriangle } from "react-icons/lu";
import { useState } from "react";
import { equipmentLoansService } from "../services/equipment-loans";
import type { EquipmentLoanDetailDTO, CreateEquipmentLoanRequest } from "@alentapp/shared";
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
import { toaster } from "../components/ui/toaster";
import { useApi } from "../hooks/useApi";
import { useDialog } from "../hooks/useDialog";
import { membersService } from "../services/members";

const statusColorMap: Record<string, string> = {
  Active: "yellow",
  Returned: "green",
  Lost: "red",
};

const statusLabelMap: Record<string, string> = {
  Active: "Activo",
  Returned: "Devuelto",
  Lost: "Perdido",
};

export function EquipmentLoansView() {
  const { data: loans, isLoading, error, refresh, setData } = useApi(() => equipmentLoansService.getAll());
  const dialog = useDialog<EquipmentLoanDetailDTO>();

  const [formData, setFormData] = useState<CreateEquipmentLoanRequest>({
    memberId: "",
    equipmentName: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<{ memberId?: string; equipmentName?: string }>({});

  const openCreateModal = () => {
    dialog.openCreate();
    setFormData({ memberId: "", equipmentName: "", notes: "" });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: { memberId?: string; equipmentName?: string } = {};
    if (!formData.memberId) errors.memberId = "El socio es requerido";
    if (!formData.equipmentName || formData.equipmentName.trim().length === 0) errors.equipmentName = "El nombre del equipamiento es requerido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    dialog.setSubmitting(true);
    try {
      const created = await equipmentLoansService.create(formData);
      setData([...(loans || []), { ...created } as EquipmentLoanDetailDTO]);
      toaster.create({ title: "Préstamo registrado", type: "success" });
      dialog.close();
    } catch (err: any) {
      toaster.create({ title: err.message || "Error al registrar préstamo", type: "error" });
    } finally {
      dialog.setSubmitting(false);
    }
  };

  const handleReturn = async (id: string) => {
    try {
      const updated = await equipmentLoansService.returnLoan(id, {});
      setData((loans || []).map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
      toaster.create({ title: "Devolución registrada", type: "success" });
    } catch (err: any) {
      toaster.create({ title: err.message || "Error al devolver", type: "error" });
    }
  };

  const handleReportLost = async (id: string) => {
    const confirmed = window.confirm("¿Estás seguro de reportar este préstamo como perdido?");
    if (!confirmed) return;

    try {
      const updated = await equipmentLoansService.reportLost(id);
      setData((loans || []).map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
      toaster.create({ title: "Pérdida reportada", type: "success" });
    } catch (err: any) {
      toaster.create({ title: err.message || "Error al reportar pérdida", type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    const loan = loans?.find((l) => l.id === id);
    if (!loan) return;
    const confirmed = window.confirm(`¿Eliminar préstamo de "${loan.equipmentName}"?`);
    if (!confirmed) return;

    try {
      await equipmentLoansService.delete(id);
      setData((loans || []).filter((l) => l.id !== id));
      toaster.create({ title: "Préstamo eliminado", type: "success" });
    } catch (err: any) {
      toaster.create({ title: err.message || "Error al eliminar", type: "error" });
    }
  };

  const canDelete = (status: string) => status === "Returned" || status === "Lost";

  return (
    <DialogRoot open={dialog.isOpen} onOpenChange={(e) => !e.open && dialog.close()}>
      <Stack gap="8">
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">
              Préstamos de Equipamiento
            </Heading>
            <Text color="fg.muted" fontSize="md">
              Registrá y gestioná el material deportivo prestado a socios.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={refresh} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Nuevo Préstamo
            </Button>
          </HStack>
        </Flex>

        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Préstamo</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="ID del Socio" required errorText={formErrors.memberId}>
                  <Input
                    placeholder="UUID del socio"
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Equipamiento" required errorText={formErrors.equipmentName}>
                  <Input
                    placeholder="Ej. Pelota de fútbol"
                    value={formData.equipmentName}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Notas (opcional)">
                  <Input
                    placeholder="Observaciones"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Field>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>
              <Button type="submit" colorPalette="blue" loading={dialog.isSubmitting}>
                Registrar Préstamo
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </form>
        </DialogContent>

        {error && (
          <Box p="4" bg="red.50" color="red.700" borderRadius="md">
            <Text fontWeight="bold">Error:</Text>
            <Text>{error}</Text>
          </Box>
        )}

        <Box bg="bg.panel" borderRadius="xl" boxShadow="sm" borderWidth="1px" overflow="hidden" minH="300px">
          {isLoading ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Spinner size="xl" color="blue.500" />
                <Text color="fg.muted">Cargando préstamos...</Text>
              </Stack>
            </Center>
          ) : !loans || loans.length === 0 ? (
            <Center h="300px">
              <Text color="fg.muted">No se encontraron préstamos.</Text>
            </Center>
          ) : (
            <Table.Root size="md" variant="line" interactive>
              <Table.Header>
                <Table.Row bg="bg.muted/50">
                  <Table.ColumnHeader py="4">Equipamiento</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Socio</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Fecha Préstamo</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Estado</Table.ColumnHeader>
                  <Table.ColumnHeader py="4" textAlign="end">Acciones</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {loans.map((loan) => (
                  <Table.Row key={loan.id} _hover={{ bg: "bg.muted/30" }}>
                    <Table.Cell fontWeight="semibold">{loan.equipmentName}</Table.Cell>
                    <Table.Cell color="fg.muted">{loan.memberName || loan.memberId}</Table.Cell>
                    <Table.Cell color="fg.muted">
                      {new Date(loan.loanDate).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={statusColorMap[loan.status]} size="sm">
                        {statusLabelMap[loan.status]}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <HStack gap="2" justify="flex-end">
                        {loan.status === "Active" && (
                          <>
                            <IconButton
                              variant="ghost"
                              size="sm"
                              colorPalette="green"
                              aria-label="Devolver"
                              title="Registrar devolución"
                              onClick={() => handleReturn(loan.id)}
                            >
                              <LuUndo2 />
                            </IconButton>
                            <IconButton
                              variant="ghost"
                              size="sm"
                              colorPalette="orange"
                              aria-label="Reportar pérdida"
                              title="Reportar como perdido"
                              onClick={() => handleReportLost(loan.id)}
                            >
                              <LuAlertTriangle />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          variant="ghost"
                          size="sm"
                          colorPalette="red"
                          aria-label="Eliminar"
                          disabled={!canDelete(loan.status)}
                          title={
                            !canDelete(loan.status)
                              ? "Debe estar devuelto o perdido para eliminar"
                              : ""
                          }
                          onClick={() => handleDelete(loan.id)}
                        >
                          <LuTrash2 />
                        </IconButton>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Box>
      </Stack>
    </DialogRoot>
  );
}
