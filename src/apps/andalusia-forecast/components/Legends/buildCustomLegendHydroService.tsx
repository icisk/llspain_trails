import { Box, HStack, Text } from "@open-pioneer/chakra-integration";
import React from "react";

export function buildCustomLegend(layerId: string): React.ReactNode | undefined {
    switch (layerId) {
        case "thematic-2":
            return (
                <Box>
                    <Text fontWeight="bold" mb={2}>
                        Mapa geológico
                    </Text>

                    <HStack mb={1}>
                        <Box w="30px" h="3px" bg="red" />
                        <Text fontSize="sm">Límite de metamorfismo de contacte</Text>
                    </HStack>
                    <HStack mb={3}>
                        <Box w="30px" h="3px" bg="black" />
                        <Text fontSize="sm">Falla</Text>
                    </HStack>

                    <HStack mb={1}>
                        <Box w="20px" h="20px" bg="#b2d9d9" border="1px solid black" />
                        <Text fontSize="sm">Pizarra</Text>
                    </HStack>
                    <HStack mb={1}>
                        <Box w="20px" h="20px" bg="#ffd9ff" border="1px solid black" />
                        <Text fontSize="sm">Batolito</Text>
                    </HStack>
                    <HStack mb={1}>
                        <Box w="20px" h="20px" bg="#ff7f4c" border="1px solid black" />
                        <Text fontSize="sm">Plutones</Text>
                    </HStack>
                    <HStack>
                        <Box w="20px" h="20px" bg="#ff4c4c" border="1px solid black" />
                        <Text fontSize="sm">Diques</Text>
                    </HStack>
                </Box>
            );

        case "measure_stations":
            return (
                <Box>
                    <Text fontWeight="bold" mb={2}>Puntos de datos disponible</Text>
                    <HStack mb={1}><Box w="12px" h="12px" borderRadius="full" bg="red" border="1px solid black" /><Text fontSize="sm">IGME Base de datos de puntos de agua</Text></HStack>
                    <HStack mb={1}><Box w="12px" h="12px" borderRadius="full" bg="green" border="1px solid black" /><Text fontSize="sm">Red piezométrica - C.H.Guadiana</Text></HStack>
                    <HStack mb={1}><Box w="12px" h="12px" borderRadius="full" bg="lightblue" border="1px solid black" /><Text fontSize="sm">Red de aforos - C.H.Guadiana</Text></HStack>
                    <HStack mb={1}><Box w="12px" h="12px" borderRadius="full" bg="purple" border="1px solid black" /><Text fontSize="sm">Red de calidad de aguas subterráneas - C.H.Guadiana</Text></HStack>
                    <HStack mb={1}><Box w="12px" h="12px" borderRadius="full" bg="yellow" border="1px solid black" /><Text fontSize="sm">Red de calidad de aguas subterráneas - - C.H.Guadalquivir</Text></HStack>
                    <HStack mb={1}><Box w="12px" h="12px" borderRadius="full" bg="blue" border="1px solid black" /><Text fontSize="sm">Universidad de Córdoba</Text></HStack>
                    <HStack><Box w="12px" h="12px" borderRadius="full" bg="gray" border="1px solid black" /><Text fontSize="sm">Otros</Text></HStack>
                </Box>
            );

        case "groundwater":
            return (
                <Box>
                    <Text fontWeight="bold" mb={2}>Masas de agua subterránea</Text>
                    <HStack>
                        <Box w="30px" h="12px" border="2px solid rgb(76, 127, 255)" />
                        <Text fontSize="sm">Límite de las masas de agua subterránea</Text>
                    </HStack>
                </Box>
            );

        case "authorities_boundaries":
            return (
                <Box>
                    <Text fontWeight="bold" mb={2}>Demarcaciones administrativas</Text>
                    <HStack>
                        <Box w="30px" h="12px" border="2px solid #008000" />
                        <Text fontSize="sm">Límite las demarcaciones dentro de la comarca</Text>
                    </HStack>
                </Box>
            );

        case "municipalities":
            return (
                <Box>
                    <Text fontWeight="bold" mb={2}>Municipios</Text>
                    <HStack>
                        <Box w="30px" h="12px" border="1.5px solid #800080" />
                        <Text fontSize="sm">Límite municipal</Text>
                    </HStack>
                </Box>
            );

        case "network":
            return (
                <Box>
                    <Text fontWeight="bold" mb={2}>Red hidrografía</Text>
                    <HStack>
                        <Box w="30px" h="2px" bg="lightblue" />
                        <Text fontSize="sm">Red hidrográfica</Text>
                    </HStack>
                </Box>
            );
            case "springs":
                return (
                    <Box>
                        <Text fontWeight="bold" mb={2}>Manantiales</Text>
                        <HStack>
                            <Box
                                w="9px"
                                h="9px"
                                borderRadius="full"
                                bg="blue"
                                border="1px solid white"
                            />
                            <Text fontSize="sm">Manantial</Text>
                        </HStack>
                    </Box>
                );     
            case "catchmentGuadalquivir":
                return (
                    <Box>
                        <Text fontWeight="bold" mb={2}>Captaciones Guadalquivir</Text>
                        <HStack>
                            <Box
                                w="12px"
                                h="12px"
                                borderRadius="full"
                                bg="blue"
                                border="1px solid darkblue"
                            />
                            <Text fontSize="sm">Captaciones DPH</Text>
                        </HStack>
                    </Box>
                );
            case "catchmentGuadiana":
                return (
                    <Box>
                        <Text fontWeight="bold" mb={2}>Captaciones Guadiana</Text>
                        <HStack>
                            <Box
                                w="6px"
                                h="6px"
                                borderRadius="full"
                                bg="#c7ce71"
                                border="0px solid black"
                            />
                            <Text fontSize="sm">Captaciones DPH</Text>
                        </HStack>
                    </Box>
                );
            case "thematic-3":
                return (
                    <Box>
                        <Text fontWeight="bold" mb={2}>
                            Profundidad del nivel freático
                        </Text>

                        <HStack mb={1}>
                            <Box w="20px" h="20px" bg="rgba(128, 0, 128, 0.3)" border="1.5px solid purple" />
                            <Text fontSize="sm">Profundidad del nivel freático</Text>
                        </HStack>
                    </Box>
                );
            case "thematic-4":
                return (
                    <Box>
                        <Text fontWeight="bold" mb={2}>
                            Demarcaciones hidrográficas
                        </Text>

                        <HStack mb={1}>
                            <Box w="20px" h="20px" bg="rgba(128, 0, 128, 0.3)" border="1.5px solid purple" />
                            <Text fontSize="sm">Demarcaciones hidrográficas</Text>
                        </HStack>
                    </Box>
                );
        default:
            return undefined;
    }
}
