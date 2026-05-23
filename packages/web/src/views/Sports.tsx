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
import { useEffect, useState } from "react";
import { sportsService } from "../services/sports";
import type { SportDetailDTO, CreateSportRequest, UpdateSportRequest } from "@alentapp/shared";
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

export function SportsView() {
  const [sports, setSports] = useState<SportDetailDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSportId, setEditingSportId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateSportRequest>({
    name: "",
    description: "",
    maxCapacity: 1,
  });

  // Inline validation errors
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    maxCapacity?: string;
  }>({});

  const fetchSports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sportsService.getAll();
      setSports(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los deportes");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSportId(null);
    setFormData({ name: "", description: "", maxCapacity: 1 });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditModal = (sport: SportDetailDTO) => {
    setEditingSportId(sport.id);
    setFormData({
      name: sport.name,
      description: sport.description || "",
      maxCapacity: sport.maxCapacity,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; maxCapacity?: string } = {};

    if (!editingSportId) {
      // Name validation only on create (editing has name disabled)
      if (!formData.name || formData.name.trim().length === 0) {
        errors.name = "El nombre es requerido";
      } else if (formData.name.length > 100) {
        errors.name = "El nombre no puede superar los 100 caracteres";
      }
    }

    if (!formData.maxCapacity || formData.maxCapacity < 1) {
      errors.maxCapacity = "La capacidad máxima debe ser mayor a cero";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingSportId) {
        const updateData: UpdateSportRequest = {
          description: formData.description || undefined,
          maxCapacity: formData.maxCapacity,
        };
        await sportsService.update(editingSportId, updateData);
      } else {
        await sportsService.create(formData as CreateSportRequest);
      }
      setIsDialogOpen(false);
      fetchSports(); // Refresh the list
    } catch (err: any) {
      alert(err.message || "Error al guardar el deporte");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSport = async (id: string, name: string) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar el deporte "${name}"? Esta acción no se puede deshacer.`
      )
    ) {
      try {
        await sportsService.delete(id);
        fetchSports(); // Refresh the list
      } catch (err: any) {
        alert(err.message || "Error al eliminar el deporte");
      }
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  return (
    <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
      <Stack gap="8">
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">
              Administración de Deportes
            </Heading>
            <Text color="fg.muted" fontSize="md">
              Gestiona los deportes ofrecidos por el club.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={fetchSports} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Agregar Deporte
            </Button>
          </HStack>
        </Flex>

        {/* Modal para agregar/editar deporte */}
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingSportId ? "Editar Deporte" : "Agregar Nuevo Deporte"}
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field
                  label="Nombre"
                  required
                  errorText={formErrors.name}
                >
                  <Input
                    placeholder="Ej. Fútbol"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    readOnly={!!editingSportId}
                    disabled={!!editingSportId}
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
                    placeholder="Descripción del deporte (opcional)"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    maxLength={500}
                  />
                </Field>

                <Field
                  label="Capacidad Máxima"
                  required
                  errorText={formErrors.maxCapacity}
                >
                  <Input
                    type="number"
                    min={1}
                    placeholder="Ej. 22"
                    value={formData.maxCapacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxCapacity: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </Field>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>
              <Button type="submit" colorPalette="blue" loading={isSubmitting}>
                {editingSportId ? "Guardar Cambios" : "Crear Deporte"}
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
                <Text color="fg.muted">Cargando deportes...</Text>
              </Stack>
            </Center>
          ) : sports.length === 0 ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Text color="fg.muted">No se encontraron deportes.</Text>
                <Button variant="ghost" onClick={fetchSports}>
                  Reintentar
                </Button>
              </Stack>
            </Center>
          ) : (
            <Table.Root size="md" variant="line" interactive>
              <Table.Header>
                <Table.Row bg="bg.muted/50">
                  <Table.ColumnHeader py="4">Nombre</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Descripción</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Capacidad Máx.</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Disciplinas</Table.ColumnHeader>
                  <Table.ColumnHeader py="4" textAlign="end">
                    Acciones
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sports.map((sport) => (
                  <Table.Row key={sport.id} _hover={{ bg: "bg.muted/30" }}>
                    <Table.Cell fontWeight="semibold" color="fg.emphasized">
                      {sport.name}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">
                      {sport.description || "-"}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">{sport.maxCapacity}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        colorPalette={sport.disciplineCount > 0 ? "blue" : "gray"}
                        size="sm"
                      >
                        {sport.disciplineCount}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <HStack gap="2" justify="flex-end">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="Editar deporte"
                          onClick={() => openEditModal(sport)}
                        >
                          <LuPencil />
                        </IconButton>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          colorPalette="red"
                          aria-label="Eliminar deporte"
                          disabled={sport.disciplineCount > 0}
                          title={
                            sport.disciplineCount > 0
                              ? "No se puede eliminar: tiene disciplinas asociadas"
                              : ""
                          }
                          onClick={() =>
                            handleDeleteSport(sport.id, sport.name)
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
