import React from 'react';

import {
    MapAnchor,
    MapConfig,
    MapConfigProvider,
    MapContainer, SimpleLayer,
    useMapModel
} from "@open-pioneer/map";
import {MAP_ID, MapProvider} from "../services/MidtermForecastMapProvider";
import {Container, Flex, Box} from "@open-pioneer/chakra-integration";
import {ZoomIn, ZoomOut} from "@open-pioneer/map-navigation";
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";
import proj4 from "proj4";
import {register} from "ol/proj/proj4";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {RegionZoom} from "../components/RegionZoom/RegionZoom";
import {ZoomPointButtonComponent} from "zoom-point-button";
import {pedrochesPoint} from "../components/utils/globals";


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
                header={intl.formatMessage({id: "hydro_service.heading"})}
                description={intl.formatMessage({id: "hydro_service.heading_descr"})}
            ></InfoBoxComponent>
            <p>blabla</p>
            <Box height={"500px"}>
                <MapContainer mapId={'hydrological-forecast'} role="main"/>
            </Box>
            
            <RegionZoom MAP_ID={'hydrological-forecast'} />
            

        </Container>


    )
};

export default HydrologicalService;
