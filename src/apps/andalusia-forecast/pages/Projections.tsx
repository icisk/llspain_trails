import React from 'react';
import { Container, Box } from "@open-pioneer/chakra-integration";
import { InfoBoxComponent } from "info-box";
import { useIntl } from "open-pioneer:react-hooks";
import { Header } from "../components/MainComponents/Header";
import { MapContainer } from "@open-pioneer/map";
import { MAP_ID } from "../services/ProjectionMapProvider";

const Projections = () => {
    const intl = useIntl();
    return (
        <Container minWidth={'container.xl'}>
            <Header subpage={'projections'} />
            <Box height={"500px"}>
                <MapContainer mapId={MAP_ID} role="main" />
            </Box>
        </Container>
    );
};

export default Projections;