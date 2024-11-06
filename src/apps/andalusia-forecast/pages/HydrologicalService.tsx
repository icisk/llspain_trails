import React from 'react';

import {
    MapAnchor,
    MapConfig,
    MapConfigProvider,
    MapContainer, SimpleLayer,
    useMapModel
} from "@open-pioneer/map";
import { MAP_ID, MapProvider} from "../services/MapProvider";
import {Container, Flex, Box} from "@open-pioneer/chakra-integration";
import {ZoomIn, ZoomOut} from "@open-pioneer/map-navigation";
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";
import proj4 from "proj4";
import {register} from "ol/proj/proj4";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";


export function HydrologicalService(){

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
                <MapContainer mapId={'test'} role="main"/>
            </Box>

        </Container>


    )
};

export default HydrologicalService;
