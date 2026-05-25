import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Input,
  Spinner,
  Stack,
  Text,
  Textarea,
  Badge,
} from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { medicalCertificatesService } from "../services/medical-certificates";
import { membersService } from "../services/members";
import type {
  MedicalCertificateDTO,
  CreateMedicalCertificateRequest,
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

export function MedicalCertificatesView() {
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [certificate, setCertificate] = useState<MedicalCertificateDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateMedicalCertificateRequest>({
    memberId: "",
    expirationDate: "",
    description: "",
    doctorName: "",
  });

  const memberCollection = useMemo(
    () =>
      createListCollection({
        items: members.map((m) => ({ label: m.name, value: m.id })),
      }),
    [members],
  );

  // Fetch members on mount
  useEffect(() => {
    membersService.getAll().then(setMembers).catch(() => {});
  }, []);

  // Fetch active certificate when selected member changes
  useEffect(() => {
    if (!selectedMemberId) {
      setCertificate(null);
      setError(null);
      return;
    }
    const fetchActive = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await medicalCertificatesService.getActive(selectedMemberId);
        setCertificate(result);
      } catch (err: any) {
        setCertificate(null);
        setError(err.message || "Error al cargar el certificado");
      } finally {
        setIsLoading(false);
      }
    };
    fetchActive();
  }, [selectedMemberId]);

  const openCreateModal = () => {
    setFormData({
      memberId: selectedMemberId,
      expirationDate: "",
      description: "",
      doctorName: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: CreateMedicalCertificateRequest = {
        memberId: formData.memberId,
      };
      if (formData.expirationDate) payload.expirationDate = formData.expirationDate;
      if (formData.description) payload.description = formData.description;
      if (formData.doctorName) payload.doctorName = formData.doctorName;

      await medicalCertificatesService.create(payload);
      setIsDialogOpen(false);

      // Refetch certificate (transaction: old one was deactivated)
      const result = await medicalCertificatesService.getActive(selectedMemberId);
      setCertificate(result);
      toaster.create({ title: "Certificado creado", type: "success" });
    } catch (err: any) {
      toaster.create({ title: err.message || "Error al crear el certificado", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("es-AR");

  return (
    <DialogRoot open={isDialogOpen} onOpenChange={(e) => !e.open && setIsDialogOpen(false)}>
      <Stack gap="8">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">Certificados Médicos</Heading>
            <Text color="fg.muted" fontSize="md">
              Gestioná los certificados médicos de los socios.
            </Text>
          </Stack>
        </Flex>

        {/* Member Selector */}
        <Box p="4" bg="bg.muted/30" borderRadius="lg" borderWidth="1px">
          <Field label="Socio">
            <SelectRoot
              collection={memberCollection}
              value={selectedMemberId ? [selectedMemberId] : []}
              onValueChange={(e) => setSelectedMemberId(e.value[0] || "")}
            >
              <SelectTrigger>
                <SelectValueText placeholder="Seleccioná un socio" />
              </SelectTrigger>
              <SelectContent>
                {memberCollection.items.map((item) => (
                  <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Field>
        </Box>

        {/* Certificate Content */}
        {!selectedMemberId ? (
          <Center py="10">
            <Stack align="center" gap="4">
              <Text color="fg.muted" fontSize="lg">Seleccioná un socio para ver su certificado médico activo</Text>
            </Stack>
          </Center>
        ) : isLoading ? (
          <Center py="10">
            <Stack align="center" gap="4">
              <Spinner size="xl" color="blue.500" />
              <Text color="fg.muted">Cargando certificado...</Text>
            </Stack>
          </Center>
        ) : error ? (
          <Box p="4" bg="red.50" color="red.700" borderRadius="md" border="1px solid" borderColor="red.200">
            <Text fontWeight="bold">Error:</Text>
            <Text>{error}</Text>
          </Box>
        ) : certificate ? (
          <Box p="6" bg="bg.panel" borderRadius="xl" boxShadow="sm" borderWidth="1px">
            <Flex justify="space-between" align="flex-start" mb="4">
              <Stack gap="1">
                <Heading size="lg" fontWeight="bold">Certificado Activo</Heading>
                <Text color="fg.muted" fontSize="sm">Emitido el {formatDate(certificate.issueDate)}</Text>
              </Stack>
              <Button colorPalette="blue" size="sm" onClick={openCreateModal}>
                <LuPlus /> Nuevo Certificado
              </Button>
            </Flex>
            <Stack gap="3">
              <HStack gap="2">
                <Text fontWeight="semibold" color="fg.emphasized">Estado:</Text>
                <Badge colorPalette="green" size="sm">Activo</Badge>
              </HStack>
              {certificate.expirationDate && (
                <Text color="fg.muted"><strong>Vence:</strong> {formatDate(certificate.expirationDate)}</Text>
              )}
              {certificate.doctorName && (
                <Text color="fg.muted"><strong>Médico:</strong> {certificate.doctorName}</Text>
              )}
              {certificate.description && (
                <Text color="fg.muted"><strong>Descripción:</strong> {certificate.description}</Text>
              )}
            </Stack>
          </Box>
        ) : (
          <Center py="10">
            <Stack align="center" gap="4">
              <Text color="fg.muted" fontSize="lg">No hay certificado activo</Text>
              <Button colorPalette="blue" onClick={openCreateModal}>
                <LuPlus /> Nuevo Certificado
              </Button>
            </Stack>
          </Center>
        )}

        {/* Create Modal */}
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Nuevo Certificado Médico</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="Socio" required>
                  <SelectRoot
                    collection={memberCollection}
                    value={[formData.memberId]}
                    onValueChange={(e) => setFormData({ ...formData, memberId: e.value[0] || "" })}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Seleccioná un socio" />
                    </SelectTrigger>
                    <SelectContent>
                      {memberCollection.items.map((item) => (
                        <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>
                <Field label="Fecha de vencimiento (opcional)">
                  <Input type="date" value={formData.expirationDate || ""} onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })} />
                </Field>
                <Field label="Descripción (opcional)">
                  <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Ej. Aptitud física para deportes de contacto" />
                </Field>
                <Field label="Médico (opcional)">
                  <Input type="text" value={formData.doctorName || ""} onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })} placeholder="Nombre del médico" />
                </Field>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>
              <Button type="submit" colorPalette="blue" loading={isSubmitting}>Crear Certificado</Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </form>
        </DialogContent>
      </Stack>
    </DialogRoot>
  );
}
