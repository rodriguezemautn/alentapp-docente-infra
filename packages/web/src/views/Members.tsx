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
import { LuPlus, LuPencil, LuTrash2, LuRefreshCw } from "react-icons/lu";
import { useState } from "react";
import { membersService } from "../services/members";
import type { MemberDTO, CreateMemberRequest, UpdateMemberRequest, MemberCategory, MemberStatus } from "@alentapp/shared";
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
} from "../components/ui/select";
import { getErrorMessage } from "../lib/error-utils";
import { toaster } from "../components/ui/toaster";
import { useApi } from "../hooks/useApi";
import { useDialog } from "../hooks/useDialog";
import { MEMBER_CATEGORIES, MEMBER_STATUSES } from "../constants";

export function MembersView() {
  const { data: members, isLoading, error, refresh, setData } = useApi(() => membersService.getAll());
  const dialog = useDialog<MemberDTO>();

  // Form state
  const [formData, setFormData] = useState<CreateMemberRequest & { status?: MemberStatus }>({
    name: "",
    dni: "",
    email: "",
    birthdate: "",
    category: "Pleno",
  });

  const openCreateModal = () => {
    dialog.openCreate();
    setFormData({ name: "", dni: "", email: "", birthdate: "", category: "Pleno" });
  };

  const openEditModal = (member: MemberDTO) => {
    dialog.openEdit(member);
    setFormData({
      name: member.name,
      dni: member.dni,
      email: member.email,
      birthdate: member.birthdate,
      category: member.category,
      status: member.status,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dialog.setSubmitting(true);
    try {
      if (dialog.editingItem) {
        const updated = await membersService.update(dialog.editingItem.id, formData as UpdateMemberRequest);
        setData((members || []).map((m) => (m.id === updated.id ? updated : m)));
        toaster.create({ title: "Miembro actualizado", type: "success" });
      } else {
        const created = await membersService.create(formData as CreateMemberRequest);
        setData([...(members || []), created]);
        toaster.create({ title: "Miembro creado", type: "success" });
      }
      dialog.close();
    } catch (err: unknown) {
      toaster.create({ title: getErrorMessage(err), type: "error" });
    } finally {
      dialog.setSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al miembro "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await membersService.delete(id);
      setData((members || []).filter((m) => m.id !== id));
      toaster.create({ title: "Miembro eliminado", type: "success" });
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
            <Heading size="2xl" fontWeight="bold">Administración de Miembros</Heading>
            <Text color="fg.muted" fontSize="md">
              Gestiona los accesos y roles de los integrantes de Alentapp.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={refresh} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Agregar Miembro
            </Button>
          </HStack>
        </Flex>

        {/* Modal */}
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Miembro" : "Agregar Nuevo Miembro"}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="Nombre Completo" required>
                  <Input
                    placeholder="Ej. Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Field>
                <Field label="DNI" required>
                  <Input
                    placeholder="Ej. 12345678"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Correo Electrónico" required>
                  <Input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Fecha de Nacimiento" required>
                  <Input
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Categoría" required>
                  <SelectRoot
                    collection={MEMBER_CATEGORIES}
                    value={[formData.category]}
                    onValueChange={(e) => setFormData({ ...formData, category: e.value[0] as MemberCategory })}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBER_CATEGORIES.items.map((cat) => (
                        <SelectItem item={cat} key={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>

                {editingId && formData.status && (
                  <Field label="Estado" required>
                    <SelectRoot
                      collection={MEMBER_STATUSES}
                      value={[formData.status]}
                      onValueChange={(e) => setFormData({ ...formData, status: e.value[0] as MemberStatus })}
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Seleccione el estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEMBER_STATUSES.items.map((stat) => (
                          <SelectItem item={stat} key={stat.value}>
                            {stat.label}
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
                {editingId ? "Guardar Cambios" : "Crear Miembro"}
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
                <Text color="fg.muted">Cargando miembros...</Text>
              </Stack>
            </Center>
          ) : !members || members.length === 0 ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Text color="fg.muted">No se encontraron miembros.</Text>
                <Button variant="ghost" onClick={refresh}>Reintentar</Button>
              </Stack>
            </Center>
          ) : (
            <Table.Root size="md" variant="line" interactive>
              <Table.Header>
                <Table.Row bg="bg.muted/50">
                  <Table.ColumnHeader py="4">Nombre</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">DNI</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Correo</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Nacimiento</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Categoría</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Estado</Table.ColumnHeader>
                  <Table.ColumnHeader py="4" textAlign="end">Acciones</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {members.map((member) => (
                  <Table.Row key={member.id} _hover={{ bg: "bg.muted/30" }}>
                    <Table.Cell fontWeight="semibold" color="fg.emphasized">{member.name}</Table.Cell>
                    <Table.Cell color="fg.muted">{member.dni}</Table.Cell>
                    <Table.Cell color="fg.muted">{member.email}</Table.Cell>
                    <Table.Cell color="fg.muted">{member.birthdate}</Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette="blue" size="sm">{member.category}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={member.status === 'Activo' ? 'green' : 'orange'} size="sm">
                        {member.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <HStack gap="2" justify="flex-end">
                        <IconButton variant="ghost" size="sm" aria-label="Editar miembro" onClick={() => openEditModal(member)}>
                          <LuPencil />
                        </IconButton>
                        <IconButton variant="ghost" size="sm" colorPalette="red" aria-label="Eliminar miembro" onClick={() => handleDeleteMember(member.id, member.name)}>
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
