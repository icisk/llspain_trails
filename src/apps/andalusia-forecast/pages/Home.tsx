import React from 'react';
import { Box, Heading, Text, Image, VStack } from '@chakra-ui/react';
import logo from '../images/logo.png'

const Home: React.FC = () => {
    return (
        <Box bg="gray.50" minHeight="100vh" py={10} px={8}>
            {/* Logo */}
            <Image src={logo} alt="Andalusia Living Lab Logo" mb={6}/>

            {/* Inhalt */}
            <VStack align="start" spacing={4}>
                <Heading as="h3" size="lg" color="teal.600">
                    Welcome!
                </Heading>
                <Text fontSize="md" color="gray.700">
                    This webpage exhibits some first examples for the visualization of climate and meteorological data for Living Lab Andalusia in Spain in the I-CISK project.
                </Text>
                <Text fontSize="md" color="gray.600">
                    Navigate through the top bar to explore the different visualizations.
                </Text>
            </VStack>
        </Box>
    );
};

export default Home;
