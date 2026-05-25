import React from "react";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary que captura errores de renderizado en la UI
 * y muestra un fallback en lugar de dejar la pantalla en blanco.
 *
 * Envuelve cada ruta en routes.ts para aislamiento:
 * <Route element={<ErrorBoundary><View /></ErrorBoundary>} />
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Box p="12" maxW="600px" mx="auto" mt="8">
          <VStack gap="6" align="center" textAlign="center">
            <Box color="red.400">
              <LuTriangleAlert size="48" />
            </Box>
            <Heading size="xl">Algo salió mal</Heading>
            <Text color="fg.muted">
              Ocurrió un error inesperado al cargar esta sección.
              {this.state.error && (
                <>
                  <br />
                  <Text as="span" fontSize="sm" fontFamily="mono">
                    {this.state.error.message}
                  </Text>
                </>
              )}
            </Text>
            <Button colorPalette="blue" onClick={this.handleRetry}>
              Reintentar
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
