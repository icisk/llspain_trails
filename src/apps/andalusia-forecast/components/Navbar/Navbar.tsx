import React from "react";
import "./Navbar.css";
import { Box, HStack } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import NavButton from "./NavButton";

const Navbar: React.FC = () => {
    const intl = useIntl();
    
    return (
        <Box style={{ padding: 20 }}>
            <HStack
                spacing={2}
                justify="center"
                flexWrap="wrap"
                width="100%"
            >
                <NavButton to="/" id="home.nav" />
                <NavButton to="/forecast" id="forecast.nav" />
                <NavButton to="/historicclimatedata1" id="historic_compare.nav" />
                <NavButton to="/historicclimatestations" id="historic_stations.nav" />
                <NavButton to="/projections" id="projections.nav" />
                <NavButton to="/phenology" id="phenology.nav" />
                <NavButton to="/hydrologicalservice" id="hydro_service.nav" />
            </HStack>
        </Box>
    );
};

export default Navbar;
