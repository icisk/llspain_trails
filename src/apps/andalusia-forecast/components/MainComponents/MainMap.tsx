import React from 'react';
import {Box, Flex} from "@open-pioneer/chakra-integration";
import {MapAnchor, MapContainer} from "@open-pioneer/map";
import {MAP_ID} from "../../services/MidtermForecastMapProvider";
import {ZoomIn, ZoomOut} from "@open-pioneer/map-navigation";
import {CoordsScaleBar} from "../CoordsScaleBar/CoordsScaleBar";
import {RegionZoom} from "../RegionZoom/RegionZoom";


interface MapIdProps {
    MAP_ID: string;
}

export function MainMap({MAP_ID} :MapIdProps){
    return (
        <>
            <Box height={"500px"} pt={2}>
                <MapContainer mapId={MAP_ID} role="main">
                    <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                        <Flex role="bottom-right" direction="column" gap={1} padding={1}>
                            <ZoomIn mapId={MAP_ID}/>
                            <ZoomOut mapId={MAP_ID}/>
                        </Flex>
                    </MapAnchor>
                </MapContainer>
            </Box>
            <CoordsScaleBar MAP_ID={MAP_ID} />
            <RegionZoom MAP_ID={MAP_ID} />
        </>

    )
}
