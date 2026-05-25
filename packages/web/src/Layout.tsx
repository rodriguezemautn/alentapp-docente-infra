import { Provider } from './components/ui/provider';
import { Box, Container, Flex, Text, HStack, IconButton } from '@chakra-ui/react';
import { Toaster } from "./components/ui/toaster";
import { useColorMode } from "./components/ui/color-mode";
import { LuMoon, LuSun } from "react-icons/lu";
import { Outlet, Link as RouterLink } from "react-router";

function DarkModeToggle() {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
        <IconButton
            variant="ghost"
            size="sm"
            aria-label={colorMode === "dark" ? "Modo claro" : "Modo oscuro"}
            onClick={toggleColorMode}
        >
            {colorMode === "dark" ? <LuSun /> : <LuMoon />}
        </IconButton>
    );
}

function Layout() {
    return (
        <Provider>
                <Box as="nav" borderBottomWidth="1px" py="4" px="8" bg="bg.panel" boxShadow="sm" position="sticky" top="0" zIndex="docked">
                    <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
                        <RouterLink to="/">
                            <Text 
                                fontSize="2xl" 
                                fontWeight="bold" 
                                bgGradient="to-r" 
                                gradientFrom="blue.600" 
                                gradientTo="cyan.500" 
                                bgClip="text"
                            >
                                Alentapp
                            </Text>
                        </RouterLink>
                        <HStack gap="10">
                            <RouterLink to="/members">
                                <Text 
                                    fontWeight="semibold" 
                                    fontSize="sm" 
                                    textTransform="uppercase" 
                                    letterSpacing="wider"
                                    color="fg.muted"
                                    _hover={{ color: "blue.500", textDecoration: "none" }}
                                >
                                    Miembros
                                </Text>
                            </RouterLink>
                            <RouterLink to="/sports">
                                <Text 
                                    fontWeight="semibold" 
                                    fontSize="sm" 
                                    textTransform="uppercase" 
                                    letterSpacing="wider"
                                    color="fg.muted"
                                    _hover={{ color: "blue.500", textDecoration: "none" }}
                                >
                                    Deportes
                                </Text>
                            </RouterLink>
                            <RouterLink to="/pagos">
                                <Text 
                                    fontWeight="semibold" 
                                    fontSize="sm" 
                                    textTransform="uppercase" 
                                    letterSpacing="wider"
                                    color="fg.muted"
                                    _hover={{ color: "blue.500", textDecoration: "none" }}
                                >
                                    Pagos
                                </Text>
                            </RouterLink>
                            <RouterLink to="/certificados-medicos">
                                <Text 
                                    fontWeight="semibold" 
                                    fontSize="sm" 
                                    textTransform="uppercase" 
                                    letterSpacing="wider"
                                    color="fg.muted"
                                    _hover={{ color: "blue.500", textDecoration: "none" }}
                                >
                                    Certificados
                                </Text>
                            </RouterLink>
                            <RouterLink to="/disciplinas">
                                <Text 
                                    fontWeight="semibold" 
                                    fontSize="sm" 
                                    textTransform="uppercase" 
                                    letterSpacing="wider"
                                    color="fg.muted"
                                    _hover={{ color: "blue.500", textDecoration: "none" }}
                                >
                                    Disciplinas
                                </Text>
                            </RouterLink>
                            <DarkModeToggle />
                        </HStack>
                    </Flex>
                </Box>
                <Container maxW="7xl" py="10">
                    <Outlet />
                </Container>
                <Toaster />
            </Box>
        </Provider>
    );
}
export default Layout;
