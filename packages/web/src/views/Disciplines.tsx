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
  Textarea,
  Badge,
} from "@chakra-ui/react";
import { LuPlus, LuPencil, LuTrash2, LuRefreshCw } from "react-icons/lu";
import { useState, useMemo } from "react";
import { disciplinesService } from "../services/disciplines";
import { sportsService } from "../services/sports";
import { getErrorMessage } from "../lib/error-utils";
import type { DisciplineDetailDTO, CreateDisciplineRequest } from "@alentapp/shared";
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
import { useApi } from "../hooks/useApi";
import { useDialog } from "../hooks/useDialog";

export function DisciplinesView() {
  const { data: disciplines, isLoading, error, refresh, setData } = useApi(() => disciplinesService.getAll());
  const { data: sports } = useApi(() => sportsService.getAll());
  const dialog = useDialog<DisciplineDetailDTO>();

  // Form state
  const [formData, setFormData] = useState<CreateDisciplineRequest>({
    sportId: "",
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    schedule: "",
    professor: "",
  });

  // Inline validation errors
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    sportId?: string;
    endDate?: string;
  }>({});

  const sportCollection = useMemo(
    () =>
      createListCollection({
        items: (sports || []).map((s) => ({ label: s.name, value: s.id })),
      }),
    [sports]
  );

  const openCreateModal = () => {
    dialog.openCreate();
    setFormData({
      sportId: (sports && sports.length > 0) ? sports[0].id : "",
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      schedule: "",
      professor: "",
    });
    setFormErrors({});
  };

  const openEditModal = (discipline: DisciplineDetailDTO) => {
    dialog.openEdit(discipline);
    setFormData({
      sportId: discipline.sportId,
      name: discipline.name,
      description: discipline.description || "",
      startDate: discipline.startDate,
      endDate: discipline.endDate,
      schedule: discipline.schedule || "",
      professor: discipline.professor || "",
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; sportId?: string; endDate?: string } = {};

    if (!dialog.editingItem) {
      if (!formData.name || formData.name.trim().length === 0) {
        errors.name = "El nombre es requerido";
      }
    }

    if (!formData.sportId) {
      errors.sportId = "Debe seleccionar un deporte";
    }

    if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
      errors.endDate = "La fecha de fin debe ser posterior a la fecha de inicio";
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
        const updated = await disciplinesService.update(dialog.editingItem.id, formData);
        setData((disciplines || []).map((d) => (d.id === updated.id ? updated : d)));
        toaster.create({ title: "Disciplina actualizada", type: "success" });
      } else {
        const created = await disciplinesService.create(formData);
        setData([...(disciplines || []), created]);
        toaster.create({ title: "Disciplina creada", type: "success" });
      }
      dialog.close();
    } catch (err: unknown) {
      toaster.create({ title: getErrorMessage(err), type: "error" });
    } finally {
      dialog.setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la disciplina "${name}"?`)) return;
    try {
      await disciplinesService.delete(id);
      setData((disciplines || []).filter((d) => d.id !== id));
      toaster.create({ title: "Disciplina eliminada", type: "success" });
    } catch (err: unknown) {
      toaster.create({ title: getErrorMessage(err), type: "error" });
    }
  };

  const editingId = dialog.editingItem?.id || null;

  return (
    <DialogRoot open={dialog.isOpen} onOpenChange={(e) => !e.open && dialog.close()}>
      <Stack gap="8">
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">Administración de Disciplinas</Heading>
            <Text color="fg.muted" fontSize="md">
              Gestioná las divisiones y variantes de cada deporte.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={refresh} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Agregar Disciplina
            </Button>
          </HStack>
        </Flex>

        {/* Modal */}
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Disciplina" : "Agregar Nueva Disciplina"}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="Deporte" required errorText={formErrors.sportId}>
                  <SelectRoot
                    collection={sportCollection}
                    value={[formData.sportId]}
                    onValueChange={(e) => setFormData({ ...formData, sportId: e.value[0] || "" })}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Seleccioná un deporte" />
                    </SelectTrigger>
                    <SelectContent>
                      {sportCollection.items.map((item) => (
                        <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>

                <Field label="Nombre" required errorText={formErrors.name}>
                  <Input
                    placeholder="Ej. Fútbol Infantil"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={100}
                    required
                  />
                </Field>

                <Field label="Descripción (opcional)">
                  <Textarea
                    placeholder="Descripción de la disciplina"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    maxLength={500}
                  />
                </Field>

                <HStack gap="4">
                  <Field label="Fecha de inicio" required>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </Field>
                  <Field label="Fecha de fin" required errorText={formErrors.endDate}>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </Field>
                </HStack>

                <Field label="Horario (opcional)">
                  <Input
                    placeholder="Ej. Lunes y Miércoles 18:00"
                    value={formData.schedule || ""}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  />
                </Field>

                <Field label="Profesor (opcional)">
                  <Input
                    placeholder="Nombre del profesor"
                    value={formData.professor || ""}
                    onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                  />
                </Field>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>
              <Button type="submit" colorPalette="blue" loading={dialog.isSubmitting}>
                {editingId ? "Guardar Cambios" : "Crear Disciplina"}
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

        <Box bg="bg.panel" borderRadius="xl" boxShadow="sm" borderWidth="1px" overflow="hidden" minH="300px" position="relative">
          {isLoading ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Spinner size="xl" color="blue.500" />
                <Text color="fg.muted">Cargando disciplinas...</Text>
              </Stack>
            </Center>
          ) : !disciplines || disciplines.length === 0 ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Text color="fg.muted">No se encontraron disciplinas.</Text>
                <Button variant="ghost" onClick={refresh}>Reintentar</Button>
              </Stack>
            </Center>
          ) : (
            <Table.Root size="md" variant="line" interactive>
              <Table.Header>
                <Table.Row bg="bg.muted/50">
                  <Table.ColumnHeader py="4">Nombre</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Deporte</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Inicio</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Fin</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Horario</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Profesor</Table.ColumnHeader>
                  <Table.ColumnHeader py="4" textAlign="end">Acciones</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {disciplines.map((d) => (
                  <Table.Row key={d.id} _hover={{ bg: "bg.muted/30" }}>
                    <Table.Cell fontWeight="semibold" color="fg.emphasized">{d.name}</Table.Cell>
                    <Table.Cell><Badge colorPalette="blue" size="sm">{d.sportName}</Badge></Table.Cell>
                    <Table.Cell color="fg.muted">{d.startDate}</Table.Cell>
                    <Table.Cell color="fg.muted">{d.endDate}</Table.Cell>
                    <Table.Cell color="fg.muted">{d.schedule || "-"}</Table.Cell>
                    <Table.Cell color="fg.muted">{d.professor || "-"}</Table.Cell>
                    <Table.Cell textAlign="end">
                      <HStack gap="2" justify="flex-end">
                        <IconButton variant="ghost" size="sm" aria-label="Editar disciplina" onClick={() => openEditModal(d)}>
                          <LuPencil />
                        </IconButton>
                        <IconButton variant="ghost" size="sm" colorPalette="red" aria-label="Eliminar disciplina" onClick={() => handleDelete(d.id, d.name)}>
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
