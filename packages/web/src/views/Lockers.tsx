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
import { LuPlus, LuPencil, LuTrash2, LuRefreshCw, LuHistory } from "react-icons/lu";
import { useState } from "react";
import { lockersService } from "../services/lockers";
import type { LockerDetailDTO, CreateLockerRequest, UpdateLockerRequest, LockerStatus } from "@alentapp/shared";
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
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { Field } from "../components/ui/field";
import { toaster } from "../components/ui/toaster";
import { useApi } from "../hooks/useApi";
import { useDialog } from "../hooks/useDialog";
import { LOCKER_STATUSES, LOCKER_STATUS_FILTER } from "../constants";

const statusColorMap: Record<string, string> = {
  Available: "green",
  Occupied: "blue",
  Maintenance: "red",
};

const statusLabelMap: Record<string, string> = {
  Available: "Disponible",
  Occupied: "Ocupado",
  Maintenance: "Mantenimiento",
};

export function LockersView() {
  const { data: lockers, isLoading, error, refresh, setData } = useApi(() => lockersService.getAll());
  const dialog = useDialog<LockerDetailDTO>();

  const [formData, setFormData] = useState<CreateLockerRequest & { status?: LockerStatus }>({
    number: 0,
    location: "",
  });
  const [formErrors, setFormErrors] = useState<{ number?: string }>({});
  const [statusFilter, setStatusFilter] = useState("");

  const openCreateModal = () => {
    dialog.openCreate();
    setFormData({ number: 0, location: "" });
    setFormErrors({});
  };

  const openEditModal = (locker: LockerDetailDTO) => {
    dialog.openEdit(locker);
    setFormData({
      number: locker.number,
      location: locker.location || "",
      status: locker.status,
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: { number?: string } = {};
    if (!formData.number || formData.number <= 0) {
      errors.number = "El número debe ser un entero positivo";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    dialog.setSubmitting(true);
    try {
      if (dialog.editingItem) {
        const updateData: UpdateLockerRequest = {
          number: formData.number,
          location: formData.location || undefined,
          status: formData.status,
        };
        const updated = await lockersService.update(dialog.editingItem.id, updateData);
        setData((lockers || []).map((l) => (l.id === updated.id ? { ...updated, memberName: l.memberName } : l)));
        toaster.create({ title: "Casillero actualizado", type: "success" });
      } else {
        const created = await lockersService.create(formData);
        setData([...(lockers || []), { ...created, memberName: undefined }]);
        toaster.create({ title: "Casillero creado", type: "success" });
      }
      dialog.close();
    } catch (err: any) {
      toaster.create({
        title: err.message || "Error al guardar el casillero",
        type: "error",
      });
    } finally {
      dialog.setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, number: number) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar el casillero #${number}?`
    );
    if (!confirmed) return;

    try {
      await lockersService.delete(id);
      setData((lockers || []).filter((l) => l.id !== id));
      toaster.create({ title: "Casillero eliminado", type: "success" });
    } catch (err: any) {
      toaster.create({
        title: err.message || "Error al eliminar el casillero",
        type: "error",
      });
    }
  };

  const handleFilterChange = async (value: string) => {
    setStatusFilter(value);
    if (value === "") {
      refresh();
    } else {
      try {
        const filtered = await lockersService.getAll(value);
        setData(filtered);
      } catch (err: any) {
        toaster.create({ title: "Error al filtrar", type: "error" });
      }
    }
  };

  const editingId = dialog.editingItem?.id || null;

  return (
    <DialogRoot open={dialog.isOpen} onOpenChange={(e) => !e.open && dialog.close()}>
      <Stack gap="8">
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">
              Administración de Casilleros
            </Heading>
            <Text color="fg.muted" fontSize="md">
              Gestiona los casilleros del club y sus asignaciones.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={refresh} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Agregar Casillero
            </Button>
          </HStack>
        </Flex>

        {/* Filtro por estado */}
        <Flex maxW="xs">
          <SelectRoot
            collection={LOCKER_STATUS_FILTER}
            value={[statusFilter]}
            onValueChange={(e) => handleFilterChange(e.value?.[0] || "")}
          >
            <SelectTrigger>
              <SelectValueText placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              {LOCKER_STATUS_FILTER.items.map((item) => (
                <SelectItem item={item} key={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </Flex>

        {/* Modal */}
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Casillero" : "Agregar Nuevo Casillero"}
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="Número" required errorText={formErrors.number}>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Ej. 101"
                    value={formData.number || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, number: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </Field>

                <Field label="Ubicación">
                  <Input
                    placeholder="Ej. Planta baja, pasillo norte"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </Field>

                {editingId && (
                  <Field label="Estado">
                    <SelectRoot
                      collection={LOCKER_STATUSES}
                      value={[formData.status || "Available"]}
                      onValueChange={(e) =>
                        setFormData({ ...formData, status: (e.value?.[0] || "Available") as LockerStatus })
                      }
                    >
                      <SelectTrigger>
                        <SelectValueText />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCKER_STATUSES.items.map((item) => (
                          <SelectItem item={item} key={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Field>
                )}
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>
              <Button type="submit" colorPalette="blue" loading={dialog.isSubmitting}>
                {editingId ? "Guardar Cambios" : "Crear Casillero"}
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </form>
        </DialogContent>

        {error && (
          <Box p="4" bg="red.50" color="red.700" borderRadius="md" border="1px solid" borderColor="red.200">
            <Text fontWeight="bold">Error:</Text>
            <Text>{error}</Text>
          </Box>
        )}

        <Box
          bg="bg.panel"
          borderRadius="xl"
          boxShadow="sm"
          borderWidth="1px"
          overflow="hidden"
          minH="300px"
          position="relative"
        >
          {isLoading ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Spinner size="xl" color="blue.500" />
                <Text color="fg.muted">Cargando casilleros...</Text>
              </Stack>
            </Center>
          ) : !lockers || lockers.length === 0 ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Text color="fg.muted">No se encontraron casilleros.</Text>
                <Button variant="ghost" onClick={refresh}>
                  Reintentar
                </Button>
              </Stack>
            </Center>
          ) : (
            <Table.Root size="md" variant="line" interactive>
              <Table.Header>
                <Table.Row bg="bg.muted/50">
                  <Table.ColumnHeader py="4">Número</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Ubicación</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Estado</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Socio Asignado</Table.ColumnHeader>
                  <Table.ColumnHeader py="4" textAlign="end">Acciones</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {lockers.map((locker) => (
                  <Table.Row key={locker.id} _hover={{ bg: "bg.muted/30" }}>
                    <Table.Cell fontWeight="semibold" color="fg.emphasized">
                      #{locker.number}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">{locker.location || "-"}</Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={statusColorMap[locker.status] || "gray"} size="sm">
                        {statusLabelMap[locker.status] || locker.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell color="fg.muted">
                      {locker.memberName || (locker.memberId ? locker.memberId : "-")}
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <HStack gap="2" justify="flex-end">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="Ver historial"
                          title="Ver historial"
                        >
                          <LuHistory />
                        </IconButton>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="Editar casillero"
                          onClick={() => openEditModal(locker)}
                        >
                          <LuPencil />
                        </IconButton>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          colorPalette="red"
                          aria-label="Eliminar casillero"
                          disabled={locker.status !== "Available"}
                          title={
                            locker.status !== "Available"
                              ? "Solo se puede eliminar un casillero disponible"
                              : ""
                          }
                          onClick={() => handleDelete(locker.id, locker.number)}
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
