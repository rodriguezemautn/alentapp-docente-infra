import { Box, SimpleGrid, Heading, Text, VStack } from "@chakra-ui/react";
import {
  LuDoorOpen,
  LuPackage,
} from "react-icons/lu";
import { SectionCard } from "../components/SectionCard";

export function HomeView() {
  return (
    <Box>
      <VStack gap="6" align="flex-start" mb="12">
        <Heading
          size="4xl"
          fontWeight="extrabold"
          letterSpacing="tight"
          bgGradient="to-r"
          gradientFrom="blue.600"
          gradientTo="cyan.400"
          bgClip="text"
        >
          Bienvenido a Alentapp
        </Heading>
        <Text fontSize="xl" color="fg.muted" maxW="2xl">
          El panel de administración central para gestionar todos los aspectos de
          tu club. Seleccioná una sección a continuación para comenzar.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="8">
        <SectionCard
          title="Miembros"
          description="Administrá el padrón de socios, sus categorías, estados de cuenta y datos personales."
          to="/members"
          icon={LuUsers}
        />

        <SectionCard
          title="Deportes"
          description="Gestioná los deportes ofrecidos por el club, sus capacidades y disciplinas asociadas."
          to="/sports"
          icon={LuTrophy}
        />

        <SectionCard
          title="Pagos"
          description="Registrá y consultá pagos de socios, con filtros por rango de fechas y estado."
          to="/pagos"
          icon={LuCreditCard}
        />

        <SectionCard
          title="Certificados Médicos"
          description="Administrá los certificados médicos de los socios y consultá su estado activo."
          to="/certificados-medicos"
          icon={LuFileText}
        />

        <SectionCard
          title="Disciplinas"
          description="Administrá las divisiones y variantes de cada deporte con sus horarios y profesores."
          to="/disciplinas"
          icon={LuListTree}
        />

        <SectionCard
          title="Casilleros"
          description="Gestioná los casilleros del club, sus asignaciones y estados."
          to="/casilleros"
          icon={LuDoorOpen}
        />

        <SectionCard
          title="Préstamos de Equipamiento"
          description="Registrá y gestioná el material deportivo prestado a socios."
          to="/prestamos-equipamiento"
          icon={LuPackage}
        />
      </SimpleGrid>
    </Box>
  );
}
