import React from 'react';

import {MapAnchor, MapContainer, useMapModel} from "@open-pioneer/map";
import {MAP_ID} from "../services/MapProvider";
import {Container, Flex, Box} from "@open-pioneer/chakra-integration";
import {ZoomIn, ZoomOut} from "@open-pioneer/map-navigation";
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";


export function HydrologicalService(){
    const mapState = useMapModel(MAP_ID);
    const intl = useIntl();
    return (
        // <>       
        //     <h1>hydro service</h1>
        //     <p>mui texto</p>
        // </>

        // <InfoBoxComponent
        //     header={intl.formatMessage({id: "heading_hydro"})}
        //     description={intl.formatMessage({id: "description_hydro"})}
        // ></InfoBoxComponent>

        <Container minWidth={"container.xl"}>
            <InfoBoxComponent
                header={intl.formatMessage({id: "heading_hydro"})}
                description={intl.formatMessage({id: "description_hydro"})}
            ></InfoBoxComponent>
            <p>blabla</p>
            <Box height={"500px"}>
                <MapContainer mapId={MAP_ID} role="main"/>
            </Box>

        </Container>


    )
};

export default HydrologicalService;
