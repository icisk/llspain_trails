import React from 'react';
import { Box, Flex, Text, Link, Stack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <Box bg="gray.100" px={4} boxShadow="sm">
            <Flex h={16} alignItems="center">
                {/* Titel */}
                <Text fontSize="lg" fontWeight="bold" color="gray.800" mr={8}>
                    Andalusia Living Lab
                </Text>

                {/* Links */}
                <Stack direction="row" spacing={6}>
                    <Link as={RouterLink} to="/" color="gray.600" fontSize="sm" _hover={{ color: "gray.800" }}>
                        Home
                    </Link>
                    <Link as={RouterLink} to="/forecast" color="gray.600" fontSize="sm" _hover={{ color: "gray.800" }}>
                        Forecast
                    </Link>
                    <Link as={RouterLink} to="/historicclimatedata1" color="gray.600" fontSize="sm" _hover={{ color: "gray.800" }}>
                        Historic Climate Data 1
                    </Link>
                    <Link as={RouterLink} to="/historicclimatedata2" color="gray.600" fontSize="sm" _hover={{ color: "gray.800" }}>
                        Historic Climate Data 2
                    </Link>
                    <Link as={RouterLink} to="/biologicaleffectivedegreedays" color="gray.600" fontSize="sm" _hover={{ color: "gray.800" }}>
                        Biological Effective Degree Days
                    </Link>
                </Stack>
            </Flex>
        </Box>
    );
};

export default Navbar;
