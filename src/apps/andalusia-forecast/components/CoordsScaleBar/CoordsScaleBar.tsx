import React from 'react';
import {Box, HStack, Spacer} from "@open-pioneer/chakra-integration";
import {CoordinateViewer} from "@open-pioneer/coordinate-viewer";
import {ScaleBar} from "@open-pioneer/scale-bar";
import {ScaleViewer} from "@open-pioneer/scale-viewer";

interface MapIdProps {
    MAP_ID: string;
}

export function CoordsScaleBar({MAP_ID} :MapIdProps){
    return (
        <Box>
            <HStack height="24px">
                <CoordinateViewer mapId={MAP_ID} displayProjectionCode="EPSG:4326" precision={3}/>
                <Spacer/>
                <ScaleBar mapId={MAP_ID}></ScaleBar>
                <ScaleViewer mapId={MAP_ID}></ScaleViewer>
            </HStack>
        </Box>
    )
}

