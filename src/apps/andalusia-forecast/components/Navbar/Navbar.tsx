import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import {Box, HStack, Button} from "@chakra-ui/react";

const Navbar: React.FC = () => {
    return (
            <Box style={{padding: 20}}>
                <HStack spacing={4} justify="space-evenly" width="100%">
                    <Button as={Link} to="/" variant="outline">
                        Home
                    </Button>
                    <Button as={Link} to="/forecast" variant="outline">
                        Forecast
                    </Button>
                    <Button as={Link} to="/historicclimatedata1" variant="outline">
                        comparing 2 Timesteps
                    </Button>
                    <Button as={Link} to="/historicclimatedata2" variant="outline">
                        climate projections (?)
                    </Button>
                    <Button as={Link} to="/biologicaleffectivedegreedays" variant="outline">
                        Bioindicators/ Drought
                    </Button>
                    <Button as={Link} to="/hydrologicalservice" variant="outline">
                        Hydro Service
                    </Button>
                </HStack>
            </Box>

);
};

export default Navbar;
