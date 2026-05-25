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
import { useEffect, useState, useMemo } from "react";
import { disciplinesService } from "../services/disciplines";
import { sportsService } from "../services/sports";
import type { DisciplineDetailDTO, CreateDisciplineRequest, UpdateDisciplineRequest, SportDTO } from "@alentapp/shared";
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

export function DisciplinesView() {
  const [disciplines, setDisciplines] = useState<DisciplineDetailDTO[]>([]);
  const [sports, setSports] = useState<SportDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDisciplineId, setEditingDisciplineId] = useState<string | null>(null);

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
    sportId?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const sportCollection = useMemo(
    () =>
      createListCollection({
        items: sports.map((s) => ({ label: s.name, value: s.id })),
      }),
    [sports]
  );

  // Sport name lookup for table display (fallback if sportName not in DTO)
  const sportNameMap = useMemo(() => {
    const map = new Map<string, string>();
    sports.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [sports]);

  const fetchDisciplines = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await disciplinesService.getAll();
      setDisciplines(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar las disciplinas");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSports = async () => {
    try {
      const data = await sportsService.getAll();
      setSports(data);
    } catch {
      // Silently fail — sports are auxiliary for form and display
    }
  };

  const openCreateModal = () => {
    setEditingDisciplineId(null);
    setFormData({
      sportId: sports.length > 0 ? sports[0].id : "",
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      schedule: "",
      professor: "",
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditModal = (discipline: DisciplineDetailDTO) => {
    setEditingDisciplineId(discipline.id);
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
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: { sportId?: string; name?: string; startDate?: string; endDate?: string } = {};

    if (!formData.sportId) {
      errors.sportId = "El deporte es requerido";
    }

    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = "El nombre es requerido";
    } else if (formData.name.length > 100) {
      errors.name = "El nombre no puede superar los 100 caracteres";
    }

    if (!formData.startDate) {
      errors.startDate = "La fecha de inicio es requerida";
    }

    if (!formData.endDate) {
      errors.endDate = "La fecha de fin es requerida";
    } else if (formData.startDate && formData.endDate <= formData.startDate) {
      errors.endDate = "La fecha de fin debe ser posterior a la fecha de inicio";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingDisciplineId) {
        const updateData: UpdateDisciplineRequest = {
          name: formData.name,
          description: formData.description || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate,
          schedule: formData.schedule || undefined,
          professor: formData.professor || undefined,
        };
        await disciplinesService.update(editingDisciplineId, updateData);
      } else {
        await disciplinesService.create(formData as CreateDisciplineRequest);
      }
      setIsDialogOpen(false);
      fetchDisciplines(); // Refresh the list
    } catch (err: any) {
      alert(err.message || "Error al guardar la disciplina");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDiscipline = async (id: string, name: string) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar la disciplina "${name}"? Esta acción no se puede deshacer.`
      )
    ) {
      try {
        await disciplinesService.delete(id);
        fetchDisciplines(); // Refresh the list
      } catch (err: any) {
        alert(err.message || "Error al eliminar la disciplina");
      }
    }
  };

  useEffect(() => {
    fetchSports();
    fetchDisciplines();
  }, []);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
      <Stack gap="8">
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">
              Administración de Disciplinas
            </Heading>
            <Text color="fg.muted" fontSize="md">
              Gestiona las disciplinas o divisiones de cada deporte.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={fetchDisciplines} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Agregar Disciplina
            </Button>
          </HStack>
        </Flex>

        {/* Modal para agregar/editar disciplina */}
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingDisciplineId ? "Editar Disciplina" : "Agregar Nueva Disciplina"}
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field
                  label="Deporte"
                  required
                  errorText={formErrors.sportId}
                >
                  <SelectRoot
                    collection={sportCollection}
                    value={[formData.sportId]}
                    onValueChange={(e) =>
                      setFormData({ ...formData, sportId: e.value[0] || "" })
                    }
                    disabled={!!editingDisciplineId}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Seleccione un deporte" />
                    </SelectTrigger>
                    <SelectContent>
                      {sportCollection.items.map((item) => (
                        <SelectItem item={item} key={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>

                <Field
                  label="Nombre"
                  required
                  errorText={formErrors.name}
                >
                  <Input
                    placeholder="Ej. Fútbol Infantil"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    maxLength={100}
                  />
                </Field>

                <Field
                  label="Descripción"
                  helperText={
                    <Text as="span" color="fg.muted" fontSize="sm">
                      {formData.description?.length || 0}/500
                    </Text>
                  }
                >
                  <Textarea
                    placeholder="Descripción de la disciplina (opcional)"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    maxLength={500}
                  />
                </Field>

                <Field
                  label="Fecha de inicio"
                  required
                  errorText={formErrors.startDate}
                >
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </Field>

                <Field
                  label="Fecha de fin"
                  required
                  errorText={formErrors.endDate}
                >
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </Field>

                <Field label="Horario">
                  <Input
                    placeholder="Ej. Lunes y Miércoles 18-20"
                    value={formData.schedule || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, schedule: e.target.value })
                    }
                    maxLength={200}
                  />
                </Field>

                <Field label="Profesor">
                  <Input
                    placeholder="Nombre del profesor (opcional)"
                    value={formData.professor || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, professor: e.target.value })
                    }
                    maxLength={200}
                  />
                </Field>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>
              <Button type="submit" colorPalette="blue" loading={isSubmitting}>
                {editingDisciplineId ? "Guardar Cambios" : "Crear Disciplina"}
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </form>
        </DialogContent>

        {error && (
          <Box
            p="4"
            bg="red.50"
            color="red.700"
            borderRadius="md"
            border="1px solid"
            borderColor="red.200"
          >
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
                <Text color="fg.muted">Cargando disciplinas...</Text>
              </Stack>
            </Center>
          ) : disciplines.length === 0 ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Text color="fg.muted">No se encontraron disciplinas.</Text>
                <Button variant="ghost" onClick={fetchDisciplines}>
                  Reintentar
                </Button>
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
                  <Table.ColumnHeader py="4" textAlign="end">
                    Acciones
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {disciplines.map((discipline) => (
                  <Table.Row key={discipline.id} _hover={{ bg: "bg.muted/30" }}>
                    <Table.Cell fontWeight="semibold" color="fg.emphasized">
                      {discipline.name}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">
                      {discipline.sportName || sportNameMap.get(discipline.sportId) || "-"}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">
                      {formatDate(discipline.startDate)}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">
                      {formatDate(discipline.endDate)}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">
                      {discipline.schedule || "-"}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">
                      {discipline.professor || "-"}
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <HStack gap="2" justify="flex-end">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="Editar disciplina"
                          onClick={() => openEditModal(discipline)}
                        >
                          <LuPencil />
                        </IconButton>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          colorPalette="red"
                          aria-label="Eliminar disciplina"
                          onClick={() =>
                            handleDeleteDiscipline(discipline.id, discipline.name)
                          }
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
