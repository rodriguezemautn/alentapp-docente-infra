import { Box, Heading, Stack, Text, Flex, Spinner, Center, Badge, StatRoot, StatLabel, StatValueText, StatHelpText, SimpleGrid } from "@chakra-ui/react";
import { LuRefreshCw } from "react-icons/lu";
import { Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { reportsService } from "../services/reports";
import type { MemberReportResponse, LockerReportResponse, MaterialReportResponse } from "@alentapp/shared";

export function ReportsView() {
  const [memberReport, setMemberReport] = useState<MemberReportResponse | null>(null);
  const [lockerReport, setLockerReport] = useState<LockerReportResponse | null>(null);
  const [materialReport, setMaterialReport] = useState<MaterialReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [members, lockers, materials] = await Promise.all([
        reportsService.getMemberReport(),
        reportsService.getLockerReport(),
        reportsService.getMaterialReport(),
      ]);
      setMemberReport(members);
      setLockerReport(lockers);
      setMaterialReport(materials);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  return (
    <Stack gap="8">
      <Flex justify="space-between" align="center">
        <Stack gap="1">
          <Heading size="2xl" fontWeight="bold">Reportes del Club</Heading>
          <Text color="fg.muted">Indicadores clave y estadísticas del club.</Text>
        </Stack>
        <Button variant="outline" onClick={fetchReports} disabled={isLoading}>
          <LuRefreshCw /> Actualizar
        </Button>
      </Flex>

      {error && (
        <Box p="4" bg="red.50" color="red.700" borderRadius="md">
          <Text fontWeight="bold">Error:</Text>
          <Text>{error}</Text>
        </Box>
      )}

      {isLoading ? (
        <Center h="300px">
          <Spinner size="xl" color="blue.500" />
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
          {/* Socios */}
          {memberReport && (
            <Box bg="bg.panel" p="6" borderRadius="xl" boxShadow="sm" borderWidth="1px">
              <Heading size="lg" mb="4">Socios</Heading>
              <StatRoot>
                <StatLabel>Total</StatLabel>
                <StatValueText>{memberReport.total}</StatValueText>
                <StatHelpText>
                  Morosidad: {memberReport.delinquencyRate}%
                </StatHelpText>
              </StatRoot>
              <Stack mt="4" gap="2">
                <Flex justify="between">
                  <Text>Plenos:</Text>
                  <Badge>{memberReport.byCategory.Pleno}</Badge>
                </Flex>
                <Flex justify="between">
                  <Text>Cadetes:</Text>
                  <Badge>{memberReport.byCategory.Cadete}</Badge>
                </Flex>
                <Flex justify="between">
                  <Text>Honorarios:</Text>
                  <Badge>{memberReport.byCategory.Honorario}</Badge>
                </Flex>
              </Stack>
            </Box>
          )}

          {/* Casilleros */}
          {lockerReport && (
            <Box bg="bg.panel" p="6" borderRadius="xl" boxShadow="sm" borderWidth="1px">
              <Heading size="lg" mb="4">Casilleros</Heading>
              <StatRoot>
                <StatLabel>Total</StatLabel>
                <StatValueText>{lockerReport.total}</StatValueText>
                <StatHelpText>
                  Ocupación: {lockerReport.occupancyRate}%
                </StatHelpText>
              </StatRoot>
              <Stack mt="4" gap="2">
                <Flex justify="between">
                  <Text>Disponibles:</Text>
                  <Badge colorPalette="green">{lockerReport.available}</Badge>
                </Flex>
                <Flex justify="between">
                  <Text>Ocupados:</Text>
                  <Badge colorPalette="blue">{lockerReport.occupied}</Badge>
                </Flex>
                <Flex justify="between">
                  <Text>Mantenimiento:</Text>
                  <Badge colorPalette="red">{lockerReport.maintenance}</Badge>
                </Flex>
              </Stack>
            </Box>
          )}

          {/* Material */}
          {materialReport && (
            <Box bg="bg.panel" p="6" borderRadius="xl" boxShadow="sm" borderWidth="1px">
              <Heading size="lg" mb="4">Material Deportivo</Heading>
              <StatRoot>
                <StatLabel>Total Préstamos</StatLabel>
                <StatValueText>{materialReport.totalLoans}</StatValueText>
              </StatRoot>
              <Stack mt="4" gap="2">
                <Flex justify="between">
                  <Text>Activos:</Text>
                  <Badge colorPalette="yellow">{materialReport.byStatus.active}</Badge>
                </Flex>
                <Flex justify="between">
                  <Text>Devueltos:</Text>
                  <Badge colorPalette="green">{materialReport.byStatus.returned}</Badge>
                </Flex>
                <Flex justify="between">
                  <Text>Perdidos:</Text>
                  <Badge colorPalette="red">{materialReport.byStatus.lost}</Badge>
                </Flex>
              </Stack>
            </Box>
          )}
        </SimpleGrid>
      )}
    </Stack>
  );
}
